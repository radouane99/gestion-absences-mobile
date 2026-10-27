/* global __dirname */
// Real SQLite integration tests; the adapter only replaces Expo's native bridge.
const { DatabaseSync } = require('node:sqlite');
const { readFileSync, mkdtempSync, rmSync, rmdirSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { runInNewContext } = require('node:vm');
const { transpileModule, ModuleKind } = require('typescript');
const assert = require('node:assert/strict');
const dossier = mkdtempSync(join(tmpdir(), 'absences-test-'));
const chemin = join(dossier, 'test.db');
let db = new DatabaseSync(chemin);
function repository() {
  const cache = new Map();
  const adapter = {
    execAsync: async (sql) => db.exec(sql),
    runAsync: async (sql, ...params) => db.prepare(sql).run(...params),
    getFirstAsync: async (sql, ...params) => db.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql, ...params) => db.prepare(sql).all(...params),
    closeAsync: async () => db.close(),
    withExclusiveTransactionAsync: async (callback) => {
      db.exec('BEGIN');
      try {
        await callback(adapter);
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
  function load(name) {
    if (cache.has(name)) return cache.get(name);
    const exports = {};
    cache.set(name, exports);
    const source = readFileSync(join(__dirname, '../src/data', `${name}.ts`), 'utf8');
    const js = transpileModule(source, {
      compilerOptions: { module: ModuleKind.CommonJS },
    }).outputText;
    runInNewContext(js, {
      exports,
      require: (id) =>
        id === 'expo-sqlite'
          ? { openDatabaseAsync: async () => adapter }
          : load(id.replace('./', '')),
    });
    return exports;
  }
  return load('absences');
}
(async () => {
  // Start with the exact old schema and an existing absence: migration must preserve it.
  db.exec(`CREATE TABLE absences (id INTEGER PRIMARY KEY NOT NULL, enseignant TEXT NOT NULL, etudiantId TEXT NOT NULL, groupeId TEXT NOT NULL, matiere TEXT NOT NULL, date TEXT NOT NULL, heure TEXT NOT NULL, UNIQUE(enseignant, etudiantId, matiere, date, heure));
    INSERT INTO absences VALUES (1, 'prof@absence.ma', 'E001', 'gi1', 'mathématiques', '2020-01-01', '08:30');`);
  let repo = repository();
  const admin = await repo.connecter('ADMIN@absence.ma', 'Admin123!');
  const prof = await repo.connecter('prof@absence.ma', 'Prof123!');
  const eleve = await repo.connecter('etudiant@absence.ma', 'Etudiant123!');
  assert.equal(admin.role, 'Administrateur');
  assert.equal(eleve.etudiantId, 'E001');
  assert.equal(admin.password, undefined);
  assert.equal(await repo.connecter('prof@absence.ma', 'faux'), null);
  assert.equal((await repo.listerAbsences(prof))[0].id, 1);
  assert.ok((await repo.listerCours(eleve)).length >= 5);
  const seance = { groupeId: 'gi1', matiere: 'Mathématiques', date: '2020-01-02', heure: '08:30' };
  assert.equal(repo.validerSeance(seance), null);
  for (const patch of [
    { date: '2026-02-30' },
    { date: '2026-2-01' },
    { heure: '24:00' },
    { matiere: ' ' },
    { groupeId: '' },
  ])
    assert.ok(repo.validerSeance({ ...seance, ...patch }));
  assert.equal(await repo.enregistrerAbsences(prof, seance, ['E001', 'E002']), 2);
  assert.equal(
    await repo.enregistrerAbsences(prof, { ...seance, matiere: ' MATHÉMATIQUES ' }, ['E001']),
    0,
  );
  await assert.rejects(repo.enregistrerAbsences(eleve, seance, ['E001']));
  await assert.rejects(repo.enregistrerAbsences(prof, { ...seance, date: '2099-01-01' }, ['E001']));
  await assert.rejects(
    repo.enregistrerAbsences(prof, { ...seance, groupeId: 'inconnu' }, ['E001']),
  );
  await assert.rejects(repo.enregistrerAbsences(prof, seance, ['E004']));
  assert.equal((await repo.listerAbsences(eleve)).length, 2);
  const absence = (await repo.listerAbsences(eleve))[0];
  const autre = (await repo.listerAbsences(prof)).find((a) => a.etudiantId === 'E002');
  await assert.rejects(
    repo.deposerJustificatif(eleve, autre.id, 'Motif', 'file:///test.pdf', 'test.pdf'),
  );
  await assert.rejects(
    repo.deposerJustificatif(eleve, absence.id, '', 'file:///test.pdf', 'test.pdf'),
  );
  const justifieesAvant = (await repo.statistiques(eleve))[0].justifiees;
  await repo.deposerJustificatif(eleve, absence.id, 'Maladie', 'file:///test.pdf', 'test.pdf');
  assert.equal((await repo.statistiques(eleve))[0].justifiees, justifieesAvant);
  assert.equal((await repo.listerAbsences(eleve))[0].statut, 'En attente');
  assert.equal(
    (await repo.listerAbsences(admin)).find((a) => a.id === absence.id).fichierNom,
    'test.pdf',
  );
  await assert.rejects(repo.deciderJustificatif(eleve, absence.id, true, 'Non autorisé'));
  await repo.deciderJustificatif(prof, absence.id, false, 'Document incomplet');
  assert.equal((await repo.listerAbsences(eleve))[0].statut, 'Refusé');
  await repo.deposerJustificatif(eleve, absence.id, 'Complément', 'file:///test2.pdf', 'test2.pdf');
  await repo.deciderJustificatif(admin, absence.id, true, 'Certificat conforme');
  assert.equal((await repo.statistiques(eleve))[0].justifiees, justifieesAvant + 1);
  assert.equal((await repo.listerAbsences(eleve))[0].statut, 'Accepté');
  await assert.rejects(
    repo.deposerJustificatif(eleve, absence.id, 'Changer', 'file:///test.pdf', 'test.pdf'),
  );
  await repo.marquerLue(eleve, absence.id);
  assert.equal((await repo.listerAbsences(eleve))[0].lu, 1);
  await repo.modifierAbsence(prof, absence.id, seance); // no-op preserves justification
  assert.equal((await repo.listerAbsences(eleve))[0].statut, 'Accepté');
  await repo.modifierAbsence(prof, absence.id, { ...seance, heure: '10:00' });
  assert.equal((await repo.listerAbsences(eleve))[0].statut, 'Non justifiée');
  assert.equal((await repo.listerAbsences(eleve))[0].lu, 0);
  await assert.rejects(repo.modifierAbsence(prof, absence.id, { ...seance, date: '2020-01-01' }));
  assert.equal((await repo.listerAbsences(eleve))[0].heure, '10:00');
  await repo.ajouterEnseignant(admin, 'prof2@absence.ma', 'Password2!', 'Professeur 2');
  const prof2 = await repo.connecter('prof2@absence.ma', 'Password2!');
  assert.equal((await repo.listerAbsences(prof2)).length, 0);
  await assert.rejects(repo.modifierAbsence(prof2, absence.id, seance));
  await assert.rejects(repo.deciderJustificatif(prof2, absence.id, true, 'Non autorisé'));
  await assert.rejects(repo.ajouterEnseignant(eleve, 'x@y.ma', 'Password1!', 'X'));
  await repo.sauverGroupe(admin, '', 'Nouveau groupe');
  const groupe = (await repo.catalogue()).groupes.find((g) => g.nom === 'Nouveau groupe');
  await repo.sauverGroupe(admin, groupe.id, 'Groupe test');
  await repo.sauverEtudiant(
    admin,
    { id: 'T001', nom: 'Test Étudiant', groupeId: groupe.id },
    true,
    'test@absence.ma',
    'Password1!',
  );
  const nouveau = await repo.connecter('test@absence.ma', 'Password1!');
  assert.equal(nouveau.etudiantId, 'T001');
  await assert.rejects(
    repo.sauverEtudiant(
      admin,
      { id: 'T002', nom: 'Doublon email', groupeId: groupe.id },
      true,
      'test@absence.ma',
      'Password1!',
    ),
  );
  assert.ok(!(await repo.catalogue()).etudiants.some((e) => e.id === 'T002')); // account failure rolls back student
  await repo.sauverEtudiant(
    admin,
    { id: 'T001', nom: 'Nom modifié', groupeId: groupe.id },
    false,
    '',
    '',
  );
  assert.equal((await repo.connecter('test@absence.ma', 'Password1!')).nom, 'Nom modifié');
  const cours = { ...seance, groupeId: groupe.id };
  await repo.planifier(admin, cours, prof.email);
  await repo.planifier(admin, { ...cours, date: '2099-01-01' }, prof.email);
  await repo.enregistrerAbsences(prof, cours, ['T001']);
  let stats = (await repo.statistiques(nouveau))[0];
  assert.equal(stats.total, 1);
  assert.equal(stats.taux, 100);
  await repo.enregistrerAbsences(prof, { ...cours, heure: '10:00' }, []);
  stats = (await repo.statistiques(nouveau))[0];
  assert.equal(stats.total, 2);
  assert.equal(stats.taux, 50);
  await repo.deciderJustificatif(
    prof,
    (await repo.listerAbsences(nouveau))[0].id,
    true,
    'Justification manuelle',
  );
  stats = (await repo.statistiques(nouveau))[0];
  assert.equal(stats.justifiees, 1);
  assert.equal(stats.taux, 50);
  await assert.rejects(repo.supprimerGroupe(admin, groupe.id));
  await repo.sauverGroupe(admin, '', 'Vide');
  const vide = (await repo.catalogue()).groupes.find((g) => g.nom === 'Vide');
  await repo.supprimerGroupe(admin, vide.id);
  assert.ok(!(await repo.catalogue()).groupes.some((g) => g.id === vide.id));
  // Force the second insert to fail: the first absence and the session must roll back.
  const avant = (await repo.listerAbsences(prof)).length;
  db.exec(
    "CREATE TRIGGER fail_insert BEFORE INSERT ON absences WHEN NEW.etudiantId = 'E003' BEGIN SELECT RAISE(ABORT, 'test'); END;",
  );
  await assert.rejects(
    repo.enregistrerAbsences(prof, { ...seance, heure: '11:00' }, ['E001', 'E003']),
  );
  assert.equal((await repo.listerAbsences(prof)).length, avant);
  db.exec('DROP TRIGGER fail_insert');
  await repo.supprimerAbsence(prof, absence.id);
  assert.ok(!(await repo.listerAbsences(eleve)).some((a) => a.id === absence.id));
  // A transfer preserves past attendance, removes old future enrollments and keeps history.
  await repo.sauverEtudiant(
    admin,
    { id: 'T001', nom: 'Nom modifié', groupeId: 'gi2' },
    false,
    '',
    '',
  );
  assert.ok((await repo.effectifSeance(prof, cours)).some((e) => e.id === 'T001'));
  assert.ok(
    !(await repo.effectifSeance(prof, { ...cours, date: '2099-01-01' })).some(
      (e) => e.id === 'T001',
    ),
  );
  assert.ok(
    (await repo.listerCours(nouveau)).some(
      (s) => s.groupeId === groupe.id && s.date === '2020-01-02',
    ),
  );
  assert.ok(
    !(await repo.listerCours(nouveau)).some(
      (s) => s.groupeId === groupe.id && s.date === '2099-01-01',
    ),
  );
  const nombreCours = db.prepare('SELECT COUNT(*) AS n FROM seances').get().n;
  db.close();
  db = new DatabaseSync(chemin);
  repo = repository();
  assert.equal((await repo.connecter('test@absence.ma', 'Password1!')).nom, 'Nom modifié');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM seances').get().n, nombreCours);
  assert.equal((await repo.listerAbsences(nouveau)).length, 1);
  assert.equal((await repo.catalogue()).groupes.find((g) => g.id === groupe.id).nom, 'Groupe test');
  db.close();
  for (const suffix of ['', '-wal', '-shm']) rmSync(chemin + suffix, { force: true });
  rmdirSync(dossier);
  console.log(
    'SQLite OK : migration, persistance, comptes, rôles, CRUD, justificatifs, taux, transferts, doublons et rollback.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
