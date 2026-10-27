import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Bouton, Etat, Page, ui } from '@/components/ui/formulaire';
import { Deconnexion } from '@/components/deconnexion';
import { catalogue } from '@/data/absences';
import { useDonnees } from '@/hooks/use-donnees';
export default function GroupesScreen() {
  const etat = useDonnees(catalogue);
  return (
    <Page>
      <Text style={ui.titre}>Mes groupes</Text>
      <Etat {...etat} />
      {!etat.loading &&
        !etat.erreur &&
        etat.donnees?.groupes.map((g) => (
          <View key={g.id} style={ui.carte}>
            <Text style={ui.texte}>{g.nom}</Text>
            {etat.donnees?.etudiants
              .filter((e) => e.groupeId === g.id)
              .map((e) => (
                <Text key={e.id} style={ui.discret}>
                  {e.id} · {e.nom}
                </Text>
              ))}
            <Bouton
              titre="Saisir une séance"
              onPress={() =>
                router.push({ pathname: '/enseignant/seance', params: { groupeId: g.id } })
              }
            />
          </View>
        ))}
      <Bouton titre="Mon emploi du temps" onPress={() => router.push('/emploi-du-temps')} />
      <Bouton
        titre="Consulter les absences"
        onPress={() => router.push('/enseignant/historique')}
      />
      <Bouton titre="Taux d’absence des étudiants" onPress={() => router.push('/statistiques')} />
      <Deconnexion />
    </Page>
  );
}
