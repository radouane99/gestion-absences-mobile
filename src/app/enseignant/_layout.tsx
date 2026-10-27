import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/data/session';

export default function EnseignantLayout() {
  const { utilisateur } = useSession();
  if (utilisateur?.role !== 'Enseignant') return <Redirect href="/" />;
  return (
    <Stack screenOptions={{ headerTintColor: '#183153', headerBackTitle: 'Retour' }}>
      <Stack.Screen name="index" options={{ title: 'Espace enseignant' }} />
      <Stack.Screen name="seance" options={{ title: 'Saisir des absences' }} />
      <Stack.Screen name="historique" options={{ title: 'Absences enregistrées' }} />
    </Stack>
  );
}
