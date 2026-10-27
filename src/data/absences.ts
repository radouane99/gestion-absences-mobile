import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  Compte,
  Groupe,
  Etudiant,
  Seance,
  Cours,
  Absence,
  Statistique,
  Catalogue,
} from './models';
import { assurerSeance, cleSeance, getDatabase, params } from './database';
import { exiger, maintenant, texte, validerSeance } from './validation';

export type { Groupe, Etudiant, Seance, Cours, Absence, Statistique, Catalogue } from './models';
export { dateLocale, validerSeance } from './validation';

export async function connecter(email: string, password: string): Promise<Compte | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Compte>(
    'SELECT email, nom, role, etudiantId FROM comptes WHERE email = ? AND password = ?',
    email.trim().toLowerCase(),
    password,
  );
}
export async function catalogue(): Promise<Catalogue> {
  const db = await getDatabase();
  return {
    groupes: await db.getAllAsync<Groupe>('SELECT * FROM groupes ORDER BY nom'),
    etudiants: await db.getAllAsync<Etudiant>('SELECT * FROM etudiants ORDER BY nom'),
    enseignants: await db.getAllAsync<Compte>(
      "SELECT email, nom, role FROM comptes WHERE role = 'Enseignant' ORDER BY nom",
    ),
  };
}
export async function sauverGroupe(compte: Compte, id: string, nom: string) {
  exiger(compte, ['Administrateur']);
  const db = await getDatabase();
  if (id) await db.runAsync('UPDATE groupes SET nom = ? WHERE id = ?', texte(nom, 'Nom'), id);
  else
    await db.runAsync(
      'INSERT INTO groupes VALUES (?, ?)',
      `G${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
      texte(nom, 'Nom'),
    );
}
export async function supprimerGroupe(compte: Compte, id: string) {
  exiger(compte, ['Administrateur']);
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    if (
      await tx.getFirstAsync(
        'SELECT id FROM etudiants WHERE groupeId = ? UNION SELECT id FROM seances WHERE groupeId = ?',
        id,
        id,
      )
    )
      throw new Error(
        'Ce groupe contient des étudiants ou des séances. Il ne peut pas être supprimé.',
      );
    await tx.runAsync('DELETE FROM groupes WHERE id = ?', id);
  });
}
async function creerCompte(
  db: SQLiteDatabase,
  email: string,
  password: string,
  nom: string,
  role: string,
  etudiantId: string | null,
) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Adresse email invalide.');
  if (password.length < 8) throw new Error('Mot de passe : au moins 8 caractères.');
  await db.runAsync(
    'INSERT INTO comptes VALUES (?, ?, ?, ?, ?)',
    email.trim().toLowerCase(),
    password,
    texte(nom, 'Nom'),
    role,
    etudiantId,
  );
}
export async function sauverEtudiant(
  compte: Compte,
  e: Etudiant,
  nouveau: boolean,
  email: string,
  password: string,
) {
  exiger(compte, ['Administrateur']);
  const db = await getDatabase();
  const nom = texte(e.nom, 'Nom');
  const id = texte(e.id, 'Matricule', 30);
  await db.withExclusiveTransactionAsync(async (tx) => {
    if (nouveau) {
      await tx.runAsync('INSERT INTO etudiants VALUES (?, ?, ?)', id, nom, e.groupeId);
      await creerCompte(tx, email, password, nom, 'Étudiant', id);
      await tx.runAsync(
        "INSERT OR IGNORE INTO participants SELECT id, ? FROM seances WHERE groupeId = ? AND date || ' ' || heure > ?",
        id,
        e.groupeId,
        maintenant(),
      );
    } else {
      const ancien = await tx.getFirstAsync<Etudiant>('SELECT * FROM etudiants WHERE id = ?', id);
      if (!ancien) throw new Error('Étudiant introuvable.');
      await tx.runAsync(
        'UPDATE etudiants SET nom = ?, groupeId = ? WHERE id = ?',
        nom,
        e.groupeId,
        id,
      );
      await tx.runAsync('UPDATE comptes SET nom = ? WHERE etudiantId = ?', nom, id);
      if (ancien.groupeId !== e.groupeId) {
        await tx.runAsync(
          "DELETE FROM participants WHERE etudiantId = ? AND seanceId IN (SELECT id FROM seances WHERE date || ' ' || heure > ?)",
          id,
          maintenant(),
        );
        await tx.runAsync(
          "INSERT OR IGNORE INTO participants SELECT id, ? FROM seances WHERE groupeId = ? AND date || ' ' || heure > ?",
          id,
          e.groupeId,
          maintenant(),
        );
      }
    }
  });
}
export async function ajouterEnseignant(
  compte: Compte,
  email: string,
  password: string,
  nom: string,
) {
  exiger(compte, ['Administrateur']);
  await creerCompte(await getDatabase(), email, password, nom, 'Enseignant', null);
}
export async function planifier(compte: Compte, s: Seance, enseignant: string) {
  exiger(compte, ['Administrateur']);
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await assurerSeance(tx, s, enseignant);
  });
}
export async function listerCours(compte: Compte) {
  const db = await getDatabase();
  const where =
    compte.role === 'Étudiant'
      ? 'WHERE s.id IN (SELECT seanceId FROM participants WHERE etudiantId = ?)'
      : compte.role === 'Enseignant'
        ? 'WHERE s.enseignant = ?'
        : '';
  const args =
    compte.role === 'Étudiant'
      ? [compte.etudiantId ?? '']
      : compte.role === 'Enseignant'
        ? [compte.email]
        : [];
  return db.getAllAsync<Cours>(
    `SELECT s.*, g.nom AS groupeNom FROM seances s JOIN groupes g ON g.id = s.groupeId ${where} ORDER BY date, heure`,
    ...args,
  );
}
export async function effectifSeance(compte: Compte, s: Seance) {
  exiger(compte, ['Enseignant']);
  const db = await getDatabase();
  const cours = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM seances WHERE ${cleSeance}`,
    ...params(s, compte.email),
  );
  if (cours)
    return db.getAllAsync<Etudiant>(
      'SELECT e.* FROM etudiants e JOIN participants p ON p.etudiantId = e.id WHERE p.seanceId = ? ORDER BY e.nom',
      cours.id,
    );
  return db.getAllAsync<Etudiant>(
    'SELECT * FROM etudiants WHERE groupeId = ? ORDER BY nom',
    s.groupeId,
  );
}
export async function enregistrerAbsences(compte: Compte, seance: Seance, ids: string[]) {
  exiger(compte, ['Enseignant']);
  const db = await getDatabase();
  let ajoutes = 0;
  await db.withExclusiveTransactionAsync(async (tx) => {
    if (`${seance.date} ${seance.heure}` > maintenant())
      throw new Error('La séance n’a pas encore commencé.');
    const coursId = await assurerSeance(tx, seance, compte.email);
    for (const id of new Set(ids)) {
      if (
        !(await tx.getFirstAsync(
          'SELECT etudiantId FROM participants WHERE seanceId = ? AND etudiantId = ?',
          coursId,
          id,
        ))
      )
        throw new Error('Étudiant non inscrit à cette séance.');
      const result = await tx.runAsync(
        'INSERT OR IGNORE INTO absences (enseignant, etudiantId, groupeId, matiere, date, heure) VALUES (?, ?, ?, ?, ?, ?)',
        compte.email,
        id,
        seance.groupeId,
        seance.matiere.trim().toLocaleLowerCase('fr'),
        seance.date,
        seance.heure,
      );
      ajoutes += result.changes;
    }
  });
  return ajoutes;
}
const selectAbsences = `SELECT a.*, e.nom AS etudiantNom, g.nom AS groupeNom, COALESCE(j.statut, 'Non justifiée') AS statut, j.motif, j.fichierUri, j.fichierNom, j.commentaire, CASE WHEN l.absenceId IS NULL THEN 0 ELSE 1 END AS lu FROM absences a JOIN etudiants e ON e.id = a.etudiantId JOIN groupes g ON g.id = a.groupeId LEFT JOIN justificatifs j ON j.absenceId = a.id LEFT JOIN lectures l ON l.absenceId = a.id`;
export async function listerAbsences(compte: Compte) {
  const db = await getDatabase();
  const where =
    compte.role === 'Étudiant'
      ? 'WHERE a.etudiantId = ?'
      : compte.role === 'Enseignant'
        ? 'WHERE a.enseignant = ?'
        : '';
  const args =
    compte.role === 'Étudiant'
      ? [compte.etudiantId ?? '']
      : compte.role === 'Enseignant'
        ? [compte.email]
        : [];
  return db.getAllAsync<Absence>(
    `${selectAbsences} ${where} ORDER BY a.date DESC, a.heure DESC, a.id DESC`,
    ...args,
  );
}
async function autoriserAbsence(db: SQLiteDatabase, compte: Compte, id: number) {
  const a = await db.getFirstAsync<Absence>('SELECT * FROM absences WHERE id = ?', id);
  if (
    !a ||
    (compte.role === 'Étudiant' && a.etudiantId !== compte.etudiantId) ||
    (compte.role === 'Enseignant' && a.enseignant !== compte.email)
  )
    throw new Error('Absence introuvable ou accès refusé.');
  return a;
}
export async function modifierAbsence(compte: Compte, id: number, seance: Seance) {
  exiger(compte, ['Enseignant']);
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    const a = await autoriserAbsence(tx, compte, id);
    if (a.groupeId !== seance.groupeId)
      throw new Error('Le groupe de cette absence ne peut pas être modifié.');
    const erreur = validerSeance(seance);
    if (erreur) throw new Error(erreur);
    if (
      a.matiere === seance.matiere.trim().toLocaleLowerCase('fr') &&
      a.date === seance.date &&
      a.heure === seance.heure
    )
      return;
    if (`${seance.date} ${seance.heure}` > maintenant())
      throw new Error('La séance n’a pas encore commencé.');
    const coursId = await assurerSeance(tx, seance, compte.email);
    await tx.runAsync('INSERT OR IGNORE INTO participants VALUES (?, ?)', coursId, a.etudiantId);
    await tx.runAsync(
      'UPDATE absences SET matiere = ?, date = ?, heure = ? WHERE id = ?',
      seance.matiere.trim().toLocaleLowerCase('fr'),
      seance.date,
      seance.heure,
      id,
    );
    await tx.runAsync('DELETE FROM justificatifs WHERE absenceId = ?', id);
    await tx.runAsync('DELETE FROM lectures WHERE absenceId = ?', id);
  });
}
export async function supprimerAbsence(compte: Compte, id: number) {
  exiger(compte, ['Enseignant']);
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await autoriserAbsence(tx, compte, id);
    await tx.runAsync('DELETE FROM absences WHERE id = ?', id);
  });
}
export async function deposerJustificatif(
  compte: Compte,
  id: number,
  motif: string,
  uri: string,
  nom: string,
) {
  exiger(compte, ['Étudiant']);
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await autoriserAbsence(tx, compte, id);
    const ancien = await tx.getFirstAsync<{ statut: string }>(
      'SELECT statut FROM justificatifs WHERE absenceId = ?',
      id,
    );
    if (ancien?.statut === 'Accepté') throw new Error('Ce justificatif est déjà accepté.');
    await tx.runAsync(
      "INSERT INTO justificatifs VALUES (?, ?, ?, ?, 'En attente', NULL, ?) ON CONFLICT(absenceId) DO UPDATE SET motif = excluded.motif, fichierUri = excluded.fichierUri, fichierNom = excluded.fichierNom, statut = 'En attente', commentaire = NULL, deposeLe = excluded.deposeLe",
      id,
      texte(motif, 'Motif', 1000),
      texte(uri, 'Pièce jointe', 2000),
      texte(nom, 'Nom du fichier', 255),
      new Date().toISOString(),
    );
  });
}
export async function deciderJustificatif(
  compte: Compte,
  id: number,
  accepte: boolean,
  commentaire: string,
) {
  exiger(compte, ['Enseignant', 'Administrateur']);
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await autoriserAbsence(tx, compte, id);
    const motif = texte(commentaire, 'Commentaire de décision', 1000);
    await tx.runAsync(
      'INSERT INTO justificatifs (absenceId, motif, statut, commentaire, deposeLe) VALUES (?, ?, ?, ?, ?) ON CONFLICT(absenceId) DO UPDATE SET statut = excluded.statut, commentaire = excluded.commentaire',
      id,
      motif,
      accepte ? 'Accepté' : 'Refusé',
      motif,
      new Date().toISOString(),
    );
  });
}
export async function marquerLue(compte: Compte, id: number) {
  exiger(compte, ['Étudiant']);
  const db = await getDatabase();
  await autoriserAbsence(db, compte, id);
  await db.runAsync('INSERT OR IGNORE INTO lectures VALUES (?)', id);
}
export async function statistiques(compte: Compte): Promise<Statistique[]> {
  const db = await getDatabase();
  const cours = await listerCours(compte);
  const abs = await listerAbsences(compte);
  const cat = await catalogue();
  const participations = await db.getAllAsync<{ seanceId: number; etudiantId: string }>(
    'SELECT * FROM participants',
  );
  const idsCours = new Set(
    cours.filter((s) => `${s.date} ${s.heure}` <= maintenant()).map((s) => s.id),
  );
  return cat.etudiants
    .filter((e) => compte.role !== 'Étudiant' || e.id === compte.etudiantId)
    .map((e) => {
      const total = participations.filter(
        (p) => p.etudiantId === e.id && idsCours.has(p.seanceId),
      ).length;
      const lignes = abs.filter(
        (a) => a.etudiantId === e.id && `${a.date} ${a.heure}` <= maintenant(),
      );
      return {
        ...e,
        groupeNom: cat.groupes.find((g) => g.id === e.groupeId)?.nom ?? '',
        total,
        absences: lignes.length,
        justifiees: lignes.filter((a) => a.statut === 'Accepté').length,
        taux: total ? Math.round((lignes.length / total) * 1000) / 10 : null,
      };
    });
}
