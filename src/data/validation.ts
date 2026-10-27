import type { Compte, Seance } from './models';

export function dateLocale(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function validerSeance(s: Seance) {
  if (!s.groupeId) return 'Sélectionnez un groupe.';
  if (!s.matiere.trim() || s.matiere.trim().length > 100)
    return 'Saisissez une matière (100 caractères maximum).';
  const d = new Date(`${s.date}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date) || Number.isNaN(d.getTime()) || dateLocale(d) !== s.date)
    return 'Date invalide. Utilisez AAAA-MM-JJ.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.heure)) return 'Heure invalide. Utilisez HH:MM.';
  return null;
}
export function exiger(compte: Compte, roles: Compte['role'][]) {
  if (!roles.includes(compte.role)) throw new Error('Accès refusé.');
}
export function texte(value: string, nom: string, max = 100) {
  if (!value.trim() || value.trim().length > max)
    throw new Error(`${nom} obligatoire (${max} caractères maximum).`);
  return value.trim();
}
export function maintenant() {
  const d = new Date();
  return `${dateLocale(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
