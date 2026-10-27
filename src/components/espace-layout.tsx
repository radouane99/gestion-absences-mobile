import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/data/session';
import type { Role } from '@/data/demo';
export function EspaceLayout({ role }: { role: Role }) {
  const { utilisateur } = useSession();
  if (utilisateur?.role !== role) return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#183153',
        headerBackTitle: 'Retour',
        title: `Espace ${role.toLowerCase()}`,
      }}
    />
  );
}
