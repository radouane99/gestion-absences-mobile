/* global __dirname */
// Regression test of the real TS file workflow, with an asynchronous native bridge double.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { transpileModule, ModuleKind } = require('typescript');
const fichiers = new Set(['content://documents/certificat.pdf']);
let mode = 'ok';
let options;
let resolveCopy;
let databaseError = false;
let resultat = {
  canceled: false,
  assets: [{ uri: 'content://documents/certificat.pdf', name: 'certificat.pdf', size: 100 }],
};
const events = [];
class File {
  constructor(...parts) {
    this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
  }
  get exists() {
    return fichiers.has(this.uri);
  }
  get size() {
    return 100;
  }
  delete() {
    fichiers.delete(this.uri);
    events.push('delete');
  }
  async copy(cible) {
    events.push('copy-start');
    if (mode === 'reject') throw new Error('Missing READ permission');
    if (mode === 'delay')
      await new Promise((resolve) => {
        resolveCopy = resolve;
      });
    else await Promise.resolve();
    if (mode !== 'missing') fichiers.add(cible.uri);
    events.push('copy-end');
  }
}
class Directory {
  constructor(...parts) {
    this.uri = parts.join('/');
  }
  create() {}
}
const exportsModule = {};
const source = readFileSync(join(__dirname, '../src/data/justificatifs-fichiers.ts'), 'utf8');
const js = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } }).outputText;
runInNewContext(js, {
  exports: exportsModule,
  require: (id) => {
    if (id === 'expo-file-system')
      return {
        File,
        Directory,
        Paths: { cache: 'file:///scoped-cache', document: 'file:///scoped-documents' },
      };
    if (id === 'expo-document-picker')
      return {
        getDocumentAsync: async (value) => {
          options = value;
          return resultat;
        },
      };
    if (id === 'react-native') return { Platform: { OS: 'android' } };
    if (id === './absences')
      return {
        deposerJustificatif: async (_compte, _id, _motif, uri) => {
          events.push('database');
          assert.ok(fichiers.has(uri), 'Database must never reference a missing file');
          if (databaseError) throw new Error('Database failed');
        },
      };
    throw new Error(`Unexpected import ${id}`);
  },
});
(async () => {
  const repo = exportsModule;
  const compte = { role: 'Étudiant', etudiantId: 'E001' };
  const piece = await repo.choisirPiece();
  assert.equal(
    options.copyToCacheDirectory,
    false,
    'Android must keep the selected content URI rather than the global Expo Go cache',
  );
  assert.ok(piece.uri.startsWith('file:///scoped-cache/'));
  events.length = 0;
  mode = 'delay';
  const depot = repo.deposerPiece(compte, 1, 'Maladie', piece);
  await Promise.resolve();
  assert.deepEqual(events, ['copy-start'], 'No database write before the copy resolves');
  resolveCopy();
  await depot;
  assert.deepEqual(events, ['copy-start', 'copy-end', 'database']);
  events.length = 0;
  mode = 'reject';
  await assert.rejects(repo.deposerPiece(compte, 1, 'Maladie', piece), /READ/);
  assert.ok(
    !events.includes('database'),
    'Rejected copy must not create an apparently successful deposit',
  );
  await assert.rejects(repo.choisirPiece(), /READ/);
  mode = 'missing';
  events.length = 0;
  await assert.rejects(repo.deposerPiece(compte, 1, 'Maladie', piece), /conservé/);
  assert.ok(!events.includes('database'));
  mode = 'ok';
  databaseError = true;
  events.length = 0;
  const avant = fichiers.size;
  await assert.rejects(repo.deposerPiece(compte, 1, 'Maladie', piece), /Database failed/);
  assert.equal(fichiers.size, avant, 'Failed database write cleans up the persistent copy');
  assert.deepEqual(events, ['copy-start', 'copy-end', 'database', 'delete']);
  databaseError = false;
  events.length = 0;
  await assert.rejects(repo.deposerPiece(compte, 1, ' ', piece), /motif/);
  assert.equal(events.length, 0);
  resultat = { canceled: true };
  assert.equal(await repo.choisirPiece(), null);
  resultat = {
    canceled: false,
    assets: [{ uri: 'content://documents/test.exe', name: 'test.exe', size: 100 }],
  };
  await assert.rejects(repo.choisirPiece(), /PDF/);
  resultat = {
    canceled: false,
    assets: [{ uri: 'content://documents/test.pdf', name: 'test.pdf', size: 11 * 1024 * 1024 }],
  };
  await assert.rejects(repo.choisirPiece(), /10 Mo/);
  console.log(
    'Justificatifs OK : URI Android, attente de copie, rejet de permission, fichier absent, rollback, annulation et validations.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
