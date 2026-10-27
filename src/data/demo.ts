export type { Role, Compte } from './models';
export const comptes = [
  {
    email: 'admin@absence.ma',
    password: 'Admin123!',
    nom: 'Administration',
    role: 'Administrateur',
  },
  { email: 'prof@absence.ma', password: 'Prof123!', nom: 'Enseignant', role: 'Enseignant' },
  {
    email: 'etudiant@absence.ma',
    password: 'Etudiant123!',
    nom: 'Étudiant',
    role: 'Étudiant',
    etudiantId: 'E001',
  },
];
export const groupes = [
  { id: 'gi1', nom: 'Informatique — Groupe 1' },
  { id: 'gi2', nom: 'Informatique — Groupe 2' },
];
export const etudiants = [
  { id: 'E001', nom: 'Amine El Amrani', groupeId: 'gi1' },
  { id: 'E002', nom: 'Salma Bennani', groupeId: 'gi1' },
  { id: 'E003', nom: 'Youssef Alaoui', groupeId: 'gi1' },
  { id: 'E004', nom: 'Imane Idrissi', groupeId: 'gi2' },
  { id: 'E005', nom: 'Omar Berrada', groupeId: 'gi2' },
  { id: 'E006', nom: 'Sara Tazi', groupeId: 'gi2' },
];
