import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { Bouton, Champ, Choix, Etat, Page, ui } from '@/components/ui/formulaire';
import { catalogue, dateLocale, planifier } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
import { useAction } from '@/hooks/use-action';
export default function SeancesScreen() {
  const etat = useDonnees(catalogue);
  const { utilisateur } = useSession();
  const { busy, executer } = useAction();
  const [groupeId, setGroupe] = useState('');
  const [enseignant, setEnseignant] = useState('');
  const [matiere, setMatiere] = useState('');
  const [date, setDate] = useState(dateLocale());
  const [heure, setHeure] = useState('08:30');
  return (
    <Page>
      <Text style={ui.titre}>Planifier une séance</Text>
      <Etat {...etat} />
      {!etat.loading && !etat.erreur && (
        <>
          <Choix
            label="Groupe"
            options={etat.donnees?.groupes ?? []}
            value={groupeId}
            onChange={setGroupe}
            disabled={busy}
          />
          <Choix
            label="Enseignant"
            options={
              etat.donnees?.enseignants.map((e) => ({
                id: e.email,
                nom: `${e.nom} · ${e.email}`,
              })) ?? []
            }
            value={enseignant}
            onChange={setEnseignant}
            disabled={busy}
          />
          <Champ
            label="Matière"
            value={matiere}
            onChangeText={setMatiere}
            editable={!busy}
            maxLength={100}
          />
          <Champ
            label="Date (AAAA-MM-JJ)"
            value={date}
            onChangeText={setDate}
            editable={!busy}
            maxLength={10}
          />
          <Champ
            label="Heure de début (HH:MM)"
            value={heure}
            onChangeText={setHeure}
            editable={!busy}
            maxLength={5}
          />
          <Bouton
            titre="Enregistrer la séance"
            disabled={busy}
            onPress={() => {
              if (utilisateur)
                void executer(async () => {
                  await planifier(utilisateur, { groupeId, matiere, date, heure }, enseignant);
                  Alert.alert('Séance enregistrée', 'Elle est disponible dans l’emploi du temps.');
                });
            }}
          />
        </>
      )}
    </Page>
  );
}
