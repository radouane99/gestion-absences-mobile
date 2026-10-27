import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Bouton, Champ, Etat, Page, ui } from '@/components/ui/formulaire';
import { catalogue, sauverGroupe, supprimerGroupe } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
import { useAction } from '@/hooks/use-action';
export default function GroupesScreen() {
  const etat = useDonnees(catalogue);
  const { utilisateur } = useSession();
  const { busy, executer } = useAction();
  const [id, setId] = useState('');
  const [nom, setNom] = useState('');
  function sauver() {
    if (utilisateur)
      void executer(async () => {
        await sauverGroupe(utilisateur, id, nom);
        setId('');
        setNom('');
        etat.recharger();
        Alert.alert('Groupe enregistré');
      });
  }
  return (
    <Page>
      <Text style={ui.titre}>{id ? 'Modifier le groupe' : 'Ajouter un groupe'}</Text>
      <Champ
        label="Nom du groupe"
        value={nom}
        onChangeText={setNom}
        maxLength={100}
        editable={!busy}
      />
      <Bouton titre="Enregistrer" disabled={busy} onPress={sauver} />
      {id !== '' && (
        <Bouton
          titre="Annuler la modification"
          disabled={busy}
          onPress={() => {
            setId('');
            setNom('');
          }}
        />
      )}
      <Etat {...etat} />
      {!etat.loading &&
        !etat.erreur &&
        etat.donnees?.groupes.map((g) => (
          <View key={g.id} style={ui.carte}>
            <Text style={ui.texte}>{g.nom}</Text>
            <Bouton
              titre="Modifier"
              disabled={busy}
              onPress={() => {
                setId(g.id);
                setNom(g.nom);
              }}
            />
            <Bouton
              titre="Supprimer le groupe vide"
              disabled={busy}
              onPress={() =>
                Alert.alert('Supprimer ce groupe ?', g.nom, [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                      if (utilisateur)
                        void executer(async () => {
                          await supprimerGroupe(utilisateur, g.id);
                          etat.recharger();
                        });
                    },
                  },
                ])
              }
            />
          </View>
        ))}
    </Page>
  );
}
