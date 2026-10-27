import { useCallback } from 'react';
import { Redirect, Stack } from 'expo-router';
import { Text } from 'react-native';
import { Etat, Page, ui } from '@/components/ui/formulaire';
import { Statistiques } from '@/components/statistiques';
import { statistiques } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
export default function StatistiquesScreen() {
  const { utilisateur } = useSession();
  const charger = useCallback(
    () => (utilisateur ? statistiques(utilisateur) : Promise.resolve([])),
    [utilisateur],
  );
  const etat = useDonnees(charger);
  if (!utilisateur) return <Redirect href="/" />;
  return (
    <Page>
      <Stack.Screen options={{ headerShown: true, title: 'Statistiques' }} />
      <Text style={ui.titre}>Statistiques d’absence</Text>
      <Etat {...etat} />
      {!etat.loading && !etat.erreur && <Statistiques lignes={etat.donnees ?? []} />}
    </Page>
  );
}
