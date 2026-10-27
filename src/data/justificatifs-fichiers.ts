import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { deposerJustificatif } from './absences';
import type { Compte } from './demo';
export type Piece = { uri: string; nom: string };
export async function choisirPiece(): Promise<Piece | null> {
  // Android grants access to the selected content:// URI. DocumentPicker's global
  // cache directory is outside this experience's sandbox in Expo Go.
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png'],
    copyToCacheDirectory: Platform.OS !== 'android',
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const fichier = new File(asset.uri);
  if (!/\.(pdf|png|jpe?g)$/i.test(asset.name))
    throw new Error('Choisissez un PDF ou une image PNG/JPEG.');
  if ((asset.size ?? fichier.size) > 10 * 1024 * 1024)
    throw new Error('La pièce jointe ne doit pas dépasser 10 Mo.');
  // Copy while the picker grant is available, into this project's scoped cache.
  const cible = new File(
    Paths.cache,
    `${Date.now()}-${Math.random().toString(36).slice(2)}.${asset.name.split('.').pop()?.toLowerCase()}`,
  );
  await fichier.copy(cible);
  if (!cible.exists)
    throw new Error('Le fichier n’a pas pu être importé. Sélectionnez-le à nouveau.');
  if (cible.size > 10 * 1024 * 1024) {
    cible.delete();
    throw new Error('La pièce jointe ne doit pas dépasser 10 Mo.');
  }
  return { uri: cible.uri, nom: asset.name };
}
export async function conserverPiece(piece: Piece): Promise<Piece> {
  const dossier = new Directory(Paths.document, 'justificatifs');
  dossier.create({ idempotent: true, intermediates: true });
  const extension = piece.nom.split('.').pop()?.toLowerCase() ?? 'pdf';
  const cible = new File(
    dossier,
    `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`,
  );
  await new File(piece.uri).copy(cible);
  if (!cible.exists)
    throw new Error('Le fichier n’a pas pu être conservé. Sélectionnez-le à nouveau.');
  return { uri: cible.uri, nom: piece.nom };
}
export async function deposerPiece(compte: Compte, absenceId: number, motif: string, piece: Piece) {
  if (!motif.trim()) throw new Error('Saisissez un motif.');
  const conservee = await conserverPiece(piece);
  try {
    await deposerJustificatif(compte, absenceId, motif, conservee.uri, conservee.nom);
  } catch (error) {
    // Preserve the actual database error even if best-effort cleanup fails.
    try {
      effacerPiece(conservee.uri);
    } catch {
      /* Retry can still use the cached source. */
    }
    throw error;
  }
}
export function effacerPiece(uri: string) {
  const f = new File(uri);
  if (f.exists) f.delete();
}
export async function ouvrirPiece(uri: string) {
  const fichier = new File(uri);
  if (!fichier.exists)
    throw new Error(
      'La pièce jointe est introuvable. L’étudiant doit la sélectionner et la déposer à nouveau.',
    );
  if (!(await fichier.canPreview()))
    throw new Error(
      'Aucune application ne peut ouvrir ce fichier, ou le fichier est absent. Installez un lecteur PDF si nécessaire.',
    );
  await fichier.preview();
}
