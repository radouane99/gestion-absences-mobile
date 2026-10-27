import { useCallback } from 'react';
import { Redirect, Stack, router } from 'expo-router';
import { Text, View } from 'react-native';
import { Bouton, Etat, Page, ui } from '@/components/ui/formulaire';
import { listerCours } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
export default function EmploiScreen() {
  const { utilisateur } = useSession();
  const charger = useCallback(
    () => (utilisateur ? listerCours(utilisateur) : Promise.resolve([])),
    [utilisateur],
  );
  const etat = useDonnees(charger);
  if (!utilisateur) return <Redirect href="/" />;
  return (
    <Page>
      <Stack.Screen options={{ headerShown: true, title: 'Emploi du temps' }} />
      <Text style={ui.titre}>Séances planifiées</Text>
      <Etat {...etat} />
      {!etat.loading && !etat.erreur && (
        <>
          {!etat.donnees?.length && <Text style={ui.texte}>Aucune séance planifiée.</Text>}
          {etat.donnees?.map((s) => (
            <View key={s.id} style={ui.carte}>
              <Text style={ui.texte}>
                {s.date.split('-').reverse().join('/')} à {s.heure} · {s.matiere}
              </Text>
              <Text style={ui.discret}>
                {s.groupeNom} · {s.enseignant}
              </Text>
              {utilisateur.role === 'Enseignant' && (
                <Bouton
                  titre="Faire l’appel"
                  onPress={() =>
                    router.push({
                      pathname: '/enseignant/seance',
                      params: {
                        groupeId: s.groupeId,
                        matiere: s.matiere,
                        date: s.date,
                        heure: s.heure,
                      },
                    })
                  }
                />
              )}
            </View>
          ))}
        </>
      )}
    </Page>
  );
}
