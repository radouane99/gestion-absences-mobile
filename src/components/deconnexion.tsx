import { router } from 'expo-router';
import { useSession } from '@/data/session';
import { Bouton } from './ui/formulaire';
export function Deconnexion() {
  const { setUtilisateur } = useSession();
  return (
    <Bouton
      titre="Se déconnecter"
      onPress={() => {
        setUtilisateur(null);
        router.replace('/');
      }}
    />
  );
}
