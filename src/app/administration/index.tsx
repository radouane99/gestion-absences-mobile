import { router } from 'expo-router';
import { Text } from 'react-native';
import { Bouton, Page, ui } from '@/components/ui/formulaire';
import { Deconnexion } from '@/components/deconnexion';
export default function AdministrationScreen() {
  return (
    <Page>
      <Text style={ui.titre}>Administration</Text>
      <Bouton
        titre="Gérer les étudiants"
        onPress={() => router.push('/administration/etudiants')}
      />
      <Bouton
        titre="Ajouter un enseignant"
        onPress={() => router.push('/administration/enseignants')}
      />
      <Bouton titre="Gérer les groupes" onPress={() => router.push('/administration/groupes')} />
      <Bouton titre="Planifier une séance" onPress={() => router.push('/administration/seances')} />
      <Bouton titre="Consulter l’emploi du temps" onPress={() => router.push('/emploi-du-temps')} />
      <Bouton titre="Statistiques d’absence" onPress={() => router.push('/statistiques')} />
      <Bouton
        titre="Absences et justificatifs"
        onPress={() => router.push('/administration/justificatifs')}
      />
      <Deconnexion />
    </Page>
  );
}
