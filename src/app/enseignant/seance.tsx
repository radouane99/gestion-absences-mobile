import { useCallback, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, Text } from 'react-native';
import { Bouton, Champ, Etat, Page, ui } from '@/components/ui/formulaire';
import { catalogue, dateLocale, effectifSeance, enregistrerAbsences } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
import { useAction } from '@/hooks/use-action';
export default function SeanceScreen() {
  const params = useLocalSearchParams<{
    groupeId: string;
    matiere?: string;
    date?: string;
    heure?: string;
  }>();
  const etat = useDonnees(catalogue);
  const groupe = etat.donnees?.groupes.find((g) => g.id === params.groupeId);
  const { utilisateur } = useSession();
  const [matiere, setMatiere] = useState(params.matiere ?? '');
  const [date, setDate] = useState(params.date ?? dateLocale());
  const [heure, setHeure] = useState(params.heure ?? '08:30');
  const [selection, setSelection] = useState<string[]>([]);
  const chargerEffectif = useCallback(
    () =>
      utilisateur
        ? effectifSeance(utilisateur, { groupeId: params.groupeId, matiere, date, heure })
        : Promise.resolve([]),
    [utilisateur, params.groupeId, matiere, date, heure],
  );
  const effectif = useDonnees(chargerEffectif);
  const { busy, executer } = useAction();
  function enregistrer() {
    if (!utilisateur || !groupe) return;
    void executer(async () => {
      const ajoutes = await enregistrerAbsences(
        utilisateur,
        { groupeId: groupe.id, matiere, date, heure },
        selection,
      );
      setSelection([]);
      Alert.alert(
        'Appel validé',
        `${ajoutes} absence(s) ajoutée(s). ${selection.length - ajoutes} déjà enregistrée(s). Une sélection vide enregistre la séance sans nouvel absent.`,
        [
          { text: 'Continuer' },
          { text: 'Voir les absences', onPress: () => router.replace('/enseignant/historique') },
        ],
      );
    });
  }
  if (etat.loading || etat.erreur)
    return (
      <Page>
        <Etat {...etat} />
      </Page>
    );
  if (!groupe)
    return (
      <Page>
        <Text style={ui.texte}>Groupe introuvable.</Text>
      </Page>
    );
  return (
    <Page>
      <Text style={ui.titre}>{groupe.nom}</Text>
      <Champ
        label="Matière"
        value={matiere}
        onChangeText={(v) => {
          setMatiere(v);
          setSelection([]);
        }}
        maxLength={100}
        editable={!busy}
      />
      <Champ
        label="Date (AAAA-MM-JJ)"
        value={date}
        onChangeText={(v) => {
          setDate(v);
          setSelection([]);
        }}
        maxLength={10}
        editable={!busy}
      />
      <Champ
        label="Heure de début (HH:MM)"
        value={heure}
        onChangeText={(v) => {
          setHeure(v);
          setSelection([]);
        }}
        maxLength={5}
        editable={!busy}
      />
      <Text style={ui.texte}>
        Cochez les absents ({selection.length}). Sans sélection : aucun nouvel absent.
      </Text>
      <Text style={ui.discret}>
        Pour corriger une absence déjà saisie, utilisez son écran de détails dans l’historique.
      </Text>
      <Etat {...effectif} />
      {!effectif.loading &&
        !effectif.erreur &&
        effectif.donnees?.map((e) => {
          const absent = selection.includes(e.id);
          return (
            <Pressable
              key={e.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: absent, disabled: busy }}
              disabled={busy}
              onPress={() =>
                setSelection((ids) => (absent ? ids.filter((id) => id !== e.id) : [...ids, e.id]))
              }
              style={[ui.carte, absent && { borderColor: '#2457C5', backgroundColor: '#EAF0FF' }]}
            >
              <Text style={ui.texte}>
                {absent ? '☑' : '☐'} {e.nom}
              </Text>
              <Text style={ui.discret}>
                {e.id} · {absent ? 'À enregistrer absent' : 'Non sélectionné'}
              </Text>
            </Pressable>
          );
        })}
      <Bouton
        titre={busy ? 'Enregistrement…' : 'Valider l’appel'}
        disabled={busy || effectif.loading || !!effectif.erreur}
        onPress={enregistrer}
      />
    </Page>
  );
}
