import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { comptes, etudiants, groupes } from './demo';
import type { Seance } from './models';
import { dateLocale, validerSeance } from './validation';

export const cleSeance =
  'groupeId = ? AND enseignant = ? AND matiere = ? AND date = ? AND heure = ?';
let database: Promise<SQLiteDatabase> | undefined;
export function params(s: Seance, enseignant: string) {
  return [s.groupeId, enseignant, s.matiere.trim().toLocaleLowerCase('fr'), s.date, s.heure];
}
export async function assurerSeance(db: SQLiteDatabase, s: Seance, enseignant: string) {
  const erreur = validerSeance(s);
  if (erreur) throw new Error(erreur);
  if (!(await db.getFirstAsync('SELECT id FROM groupes WHERE id = ?', s.groupeId)))
    throw new Error('Groupe introuvable.');
  if (
    !(await db.getFirstAsync(
      "SELECT email FROM comptes WHERE email = ? AND role = 'Enseignant'",
      enseignant,
    ))
  )
    throw new Error('Enseignant introuvable.');
  const p = params(s, enseignant);
  const result = await db.runAsync(
    'INSERT OR IGNORE INTO seances (groupeId, enseignant, matiere, date, heure) VALUES (?, ?, ?, ?, ?)',
    ...p,
  );
  const cours = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM seances WHERE ${cleSeance}`,
    ...p,
  );
  if (!cours) throw new Error('Séance introuvable.');
  if (result.changes)
    await db.runAsync(
      'INSERT OR IGNORE INTO participants (seanceId, etudiantId) SELECT ?, id FROM etudiants WHERE groupeId = ?',
      cours.id,
      s.groupeId,
    );
  return cours.id;
}
async function ouvrir() {
  const db = await openDatabaseAsync('gestion-absences.db');
  try {
    await db.execAsync(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS absences (id INTEGER PRIMARY KEY NOT NULL, enseignant TEXT NOT NULL, etudiantId TEXT NOT NULL, groupeId TEXT NOT NULL, matiere TEXT NOT NULL, date TEXT NOT NULL, heure TEXT NOT NULL, UNIQUE(enseignant, etudiantId, matiere, date, heure));
      CREATE TABLE IF NOT EXISTS groupes (id TEXT PRIMARY KEY NOT NULL, nom TEXT NOT NULL UNIQUE COLLATE NOCASE);
      CREATE TABLE IF NOT EXISTS etudiants (id TEXT PRIMARY KEY NOT NULL, nom TEXT NOT NULL, groupeId TEXT NOT NULL REFERENCES groupes(id));
      CREATE TABLE IF NOT EXISTS comptes (email TEXT PRIMARY KEY NOT NULL COLLATE NOCASE, password TEXT NOT NULL, nom TEXT NOT NULL, role TEXT NOT NULL, etudiantId TEXT UNIQUE REFERENCES etudiants(id));
      CREATE TABLE IF NOT EXISTS seances (id INTEGER PRIMARY KEY NOT NULL, groupeId TEXT NOT NULL REFERENCES groupes(id), enseignant TEXT NOT NULL REFERENCES comptes(email), matiere TEXT NOT NULL, date TEXT NOT NULL, heure TEXT NOT NULL, UNIQUE(groupeId, enseignant, matiere, date, heure));
      CREATE TABLE IF NOT EXISTS participants (seanceId INTEGER NOT NULL REFERENCES seances(id), etudiantId TEXT NOT NULL REFERENCES etudiants(id), PRIMARY KEY(seanceId, etudiantId));
      CREATE TABLE IF NOT EXISTS justificatifs (absenceId INTEGER PRIMARY KEY REFERENCES absences(id) ON DELETE CASCADE, motif TEXT NOT NULL, fichierUri TEXT, fichierNom TEXT, statut TEXT NOT NULL CHECK(statut IN ('En attente', 'Accepté', 'Refusé')), commentaire TEXT, deposeLe TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS lectures (absenceId INTEGER PRIMARY KEY REFERENCES absences(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY);
      CREATE INDEX IF NOT EXISTS absences_etudiant ON absences(etudiantId);`);
    await db.withExclusiveTransactionAsync(async (tx) => {
      if (!(await tx.getFirstAsync('SELECT version FROM migrations WHERE version = 2'))) {
        for (const g of groupes)
          await tx.runAsync('INSERT OR IGNORE INTO groupes VALUES (?, ?)', g.id, g.nom);
        for (const e of etudiants)
          await tx.runAsync(
            'INSERT OR IGNORE INTO etudiants VALUES (?, ?, ?)',
            e.id,
            e.nom,
            e.groupeId,
          );
        for (const c of comptes)
          await tx.runAsync(
            'INSERT OR IGNORE INTO comptes VALUES (?, ?, ?, ?, ?)',
            c.email,
            c.password,
            c.nom,
            c.role,
            'etudiantId' in c ? (c.etudiantId ?? null) : null,
          );
        const anciens = await tx.getAllAsync<Seance & { enseignant: string; etudiantId: string }>(
          'SELECT * FROM absences',
        );
        for (const a of anciens) {
          const id = await assurerSeance(tx, a, a.enseignant);
          await tx.runAsync('INSERT OR IGNORE INTO participants VALUES (?, ?)', id, a.etudiantId);
        }
        for (const g of groupes)
          for (const offset of [-2, -1, 1, 2]) {
            const jour = new Date();
            jour.setDate(jour.getDate() + offset);
            await assurerSeance(
              tx,
              {
                groupeId: g.id,
                matiere: offset % 2 ? 'Mathématiques' : 'Informatique',
                date: dateLocale(jour),
                heure: '08:30',
              },
              'prof@absence.ma',
            );
          }
        await tx.runAsync('INSERT INTO migrations VALUES (2)');
      }
    });
    return db;
  } catch (error) {
    await db.closeAsync();
    throw error;
  }
}
export function getDatabase() {
  database ??= ouvrir().catch((error) => {
    database = undefined;
    throw error;
  });
  return database;
}
