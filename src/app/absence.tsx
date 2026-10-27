import { useCallback } from 'react';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Etat, Page, ui } from '@/components/ui/formulaire';
import {
  DecisionJustificatif,
  DepotJustificatif,
  GestionAbsence,
  PieceJointe,
} from '@/components/absence-formulaires';
import { listerAbsences, marquerLue } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
export default function AbsenceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { utilisateur } = useSession();
  const charger = useCallback(async () => {
    if (!utilisateur) return null;
    const a = (await listerAbsences(utilisateur)).find((ligne) => ligne.id === Number(id));
    if (!a) throw new Error('Absence introuvable ou accès refusé.');
    if (utilisateur.role === 'Étudiant') await marquerLue(utilisateur, a.id);
    return a;
  }, [id, utilisateur]);
  const etat = useDonnees(charger);
  const a = etat.donnees;
  if (!utilisateur) return <Redirect href="/" />;
  return (
    <Page>
      <Stack.Screen options={{ headerShown: true, title: 'Détails de l’absence' }} />
      <Etat {...etat} />
      {!etat.loading && !etat.erreur && a && (
        <>
          <Text style={ui.titre}>{a.etudiantNom}</Text>
          <View style={ui.carte}>
            <Text style={ui.texte}>
              {a.etudiantId} · {a.groupeNom}
            </Text>
            <Text style={ui.texte}>
              {a.matiere} · {a.date.split('-').reverse().join('/')} à {a.heure}
            </Text>
            <Text style={ui.discret}>Enseignant : {a.enseignant}</Text>
            <Text style={ui.texte}>Statut : {a.statut}</Text>
            {!!a.motif && <Text style={ui.texte}>Motif : {a.motif}</Text>}
            {!!a.commentaire && <Text style={ui.texte}>Décision : {a.commentaire}</Text>}
            <PieceJointe absence={a} />
          </View>
          {utilisateur.role === 'Étudiant' && (
            <DepotJustificatif
              key={`${a.id}-${a.statut}-${a.fichierUri}`}
              compte={utilisateur}
              absence={a}
              recharger={etat.recharger}
            />
          )}
          {utilisateur.role === 'Enseignant' && (
            <GestionAbsence
              key={`${a.id}-${a.date}-${a.heure}-${a.matiere}`}
              compte={utilisateur}
              absence={a}
              recharger={etat.recharger}
              retour={() => router.back()}
            />
          )}
          {utilisateur.role === 'Administrateur' && (
            <DecisionJustificatif compte={utilisateur} absence={a} recharger={etat.recharger} />
          )}
        </>
      )}
    </Page>
  );
}
