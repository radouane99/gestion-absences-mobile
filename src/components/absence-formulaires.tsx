import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Bouton, Champ, ui } from './ui/formulaire';
import {
  deciderJustificatif,
  modifierAbsence,
  supprimerAbsence,
  type Absence,
} from '@/data/absences';
import type { Compte } from '@/data/demo';
import { choisirPiece, deposerPiece, ouvrirPiece, type Piece } from '@/data/justificatifs-fichiers';
import { useAction } from '@/hooks/use-action';

export function PieceJointe({ absence }: { absence: Absence }) {
  const { busy, executer } = useAction();
  return absence.fichierUri ? (
    <Bouton
      titre={`Ouvrir : ${absence.fichierNom ?? 'justificatif'}`}
      disabled={busy}
      onPress={() => {
        void executer(() => ouvrirPiece(absence.fichierUri!));
      }}
    />
  ) : null;
}
export function DepotJustificatif({
  compte,
  absence,
  recharger,
}: {
  compte: Compte;
  absence: Absence;
  recharger: () => void;
}) {
  const [motif, setMotif] = useState(absence.motif ?? '');
  const [piece, setPiece] = useState<Piece | null>(null);
  const { busy, executer } = useAction();
  if (absence.statut === 'Accepté')
    return <Text style={ui.discret}>Justificatif accepté. Le dépôt est verrouillé.</Text>;
  return (
    <View style={ui.carte}>
      <Text style={ui.texte}>Déposer / remplacer mon justificatif</Text>
      <Champ
        label="Motif"
        value={motif}
        onChangeText={setMotif}
        multiline
        maxLength={1000}
        editable={!busy}
      />
      <Text style={ui.discret}>
        PDF, PNG ou JPEG · 10 Mo maximum. Un nouveau dépôt remet le statut à « En attente ».
      </Text>
      <Bouton
        titre={piece?.nom ?? 'Choisir une pièce jointe'}
        disabled={busy}
        onPress={() => {
          void executer(async () => {
            const p = await choisirPiece();
            if (p) setPiece(p);
          });
        }}
      />
      <Bouton
        titre="Déposer le justificatif"
        disabled={busy}
        onPress={() => {
          void executer(async () => {
            if (!motif.trim()) throw new Error('Saisissez un motif.');
            if (!piece) throw new Error('Choisissez une pièce jointe.');
            await deposerPiece(compte, absence.id, motif, piece);
            setPiece(null);
            recharger();
            Alert.alert('Justificatif déposé', 'Statut : En attente.');
          });
        }}
      />
    </View>
  );
}
export function DecisionJustificatif({
  compte,
  absence,
  recharger,
}: {
  compte: Compte;
  absence: Absence;
  recharger: () => void;
}) {
  const [commentaire, setCommentaire] = useState('');
  const { busy, executer } = useAction();
  return (
    <View style={ui.carte}>
      <Text style={ui.texte}>Justifier / traiter le justificatif</Text>
      <Champ
        label="Commentaire de décision (obligatoire)"
        value={commentaire}
        onChangeText={setCommentaire}
        multiline
        maxLength={1000}
        editable={!busy}
      />
      <Bouton
        titre="Accepter / justifier cette absence"
        disabled={busy}
        onPress={() => {
          void executer(async () => {
            await deciderJustificatif(compte, absence.id, true, commentaire);
            recharger();
            Alert.alert('Absence justifiée');
          });
        }}
      />
      <Bouton
        titre="Refuser le justificatif"
        disabled={busy}
        onPress={() => {
          void executer(async () => {
            await deciderJustificatif(compte, absence.id, false, commentaire);
            recharger();
            Alert.alert('Justificatif refusé');
          });
        }}
      />
    </View>
  );
}
export function GestionAbsence({
  compte,
  absence,
  recharger,
  retour,
}: {
  compte: Compte;
  absence: Absence;
  recharger: () => void;
  retour: () => void;
}) {
  const [matiere, setMatiere] = useState(absence.matiere);
  const [date, setDate] = useState(absence.date);
  const [heure, setHeure] = useState(absence.heure);
  const { busy, executer } = useAction();
  function modifier() {
    void executer(async () => {
      await modifierAbsence(compte, absence.id, {
        groupeId: absence.groupeId,
        matiere,
        date,
        heure,
      });
      recharger();
      Alert.alert('Absence modifiée');
    });
  }
  return (
    <>
      <DecisionJustificatif compte={compte} absence={absence} recharger={recharger} />
      <View style={ui.carte}>
        <Text style={ui.texte}>Corriger cette absence</Text>
        <Champ
          label="Matière"
          value={matiere}
          onChangeText={setMatiere}
          maxLength={100}
          editable={!busy}
        />
        <Champ
          label="Date (AAAA-MM-JJ)"
          value={date}
          onChangeText={setDate}
          maxLength={10}
          editable={!busy}
        />
        <Champ
          label="Heure (HH:MM)"
          value={heure}
          onChangeText={setHeure}
          maxLength={5}
          editable={!busy}
        />
        <Text style={ui.discret}>
          Changer la séance remet le justificatif à zéro et signale à nouveau l’absence à
          l’étudiant.
        </Text>
        <Bouton
          titre="Enregistrer la correction"
          disabled={busy}
          onPress={() =>
            Alert.alert(
              'Confirmer la correction ?',
              'Le justificatif existant sera retiré si la séance change.',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Modifier', onPress: modifier },
              ],
            )
          }
        />
        <Bouton
          titre="Annuler une absence saisie par erreur"
          disabled={busy}
          onPress={() =>
            Alert.alert(
              'Supprimer cette absence ?',
              'Le justificatif et son statut seront également retirés.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Supprimer',
                  style: 'destructive',
                  onPress: () => {
                    void executer(async () => {
                      await supprimerAbsence(compte, absence.id);
                      retour();
                    });
                  },
                },
              ],
            )
          }
        />
      </View>
    </>
  );
}
