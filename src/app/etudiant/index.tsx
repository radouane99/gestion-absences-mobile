import { useCallback } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Bouton, Etat, Page, ui } from '@/components/ui/formulaire';
import { Deconnexion } from '@/components/deconnexion';
import { ListeAbsences } from '@/components/liste-absences';
import { listerAbsences } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
export default function EtudiantScreen() {
  const { utilisateur } = useSession();
  const charger = useCallback(
    () => (utilisateur ? listerAbsences(utilisateur) : Promise.resolve([])),
    [utilisateur],
  );
  const etat = useDonnees(charger);
  const nouvelles = etat.donnees?.filter((a) => !a.lu) ?? [];
  return (
    <Page>
      <Text style={ui.titre}>Bonjour {utilisateur?.nom}</Text>
      <Bouton titre="Mon emploi du temps" onPress={() => router.push('/emploi-du-temps')} />
      <Bouton titre="Mon taux d’absence" onPress={() => router.push('/statistiques')} />
      <Etat {...etat} />
      {!etat.loading && !etat.erreur && (
        <>
          <View style={ui.carte}>
            <Text style={ui.texte}>Notifications · {nouvelles.length} nouvelle(s) absence(s)</Text>
            <Text style={ui.discret}>
              Ouvrez les détails pour marquer une absence comme lue. Notifications locales dans
              l’application.
            </Text>
          </View>
          <Text style={ui.titre}>Mes absences et justificatifs</Text>
          <ListeAbsences absences={etat.donnees ?? []} />
        </>
      )}
      <Deconnexion />
    </Page>
  );
}
