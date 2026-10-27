export type Role = 'Administrateur' | 'Enseignant' | 'Étudiant';
export type Compte = { email: string; nom: string; role: Role; etudiantId?: string | null };
export type Groupe = { id: string; nom: string };
export type Etudiant = { id: string; nom: string; groupeId: string };
export type Seance = { groupeId: string; matiere: string; date: string; heure: string };
export type Cours = Seance & { id: number; enseignant: string; groupeNom: string };
export type Absence = Seance & {
  id: number;
  enseignant: string;
  etudiantId: string;
  etudiantNom: string;
  groupeNom: string;
  statut: string;
  motif: string | null;
  fichierUri: string | null;
  fichierNom: string | null;
  commentaire: string | null;
  lu: number;
};
export type Statistique = Etudiant & {
  groupeNom: string;
  total: number;
  absences: number;
  justifiees: number;
  taux: number | null;
};
export type Catalogue = { groupes: Groupe[]; etudiants: Etudiant[]; enseignants: Compte[] };
