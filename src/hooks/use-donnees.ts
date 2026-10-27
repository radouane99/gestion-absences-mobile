import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export function messageErreur(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (/UNIQUE/i.test(message))
    return 'Cette valeur existe déjà (email, matricule, groupe ou absence).';
  if (/FOREIGN KEY/i.test(message)) return 'Le groupe ou la personne sélectionnée n’existe plus.';
  return message || 'Une erreur est survenue. Réessayez.';
}
/** Reload on screen focus; ignore late results after navigation or another request. */
export function useDonnees<T>(charger: () => Promise<T>) {
  const [donnees, setDonnees] = useState<T>();
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const recharger = useCallback(() => setRevision((n) => n + 1), []);
  useFocusEffect(
    useCallback(() => {
      let actif = true;
      setLoading(true);
      setErreur('');
      charger()
        .then((value) => {
          if (actif) setDonnees(value);
        })
        .catch((error) => {
          if (actif) setErreur(messageErreur(error));
        })
        .finally(() => {
          if (actif) setLoading(false);
        });
      return () => {
        actif = false;
      };
      // The revision intentionally triggers a new request on explicit retry.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [charger, revision]),
  );
  return { donnees, erreur, loading, recharger };
}
