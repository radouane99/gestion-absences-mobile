import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Bouton, Champ, Etat, Page, ui } from '@/components/ui/formulaire';
import { ajouterEnseignant, catalogue } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
import { useAction } from '@/hooks/use-action';
export default function EnseignantsScreen() {
  const etat = useDonnees(catalogue);
  const { utilisateur } = useSession();
  const { busy, executer } = useAction();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <Page>
      <Text style={ui.titre}>Ajouter un enseignant</Text>
      <Champ
        label="Nom complet"
        value={nom}
        onChangeText={setNom}
        editable={!busy}
        maxLength={100}
      />
      <Champ
        label="Email"
        value={email}
        onChangeText={setEmail}
        editable={!busy}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Champ
        label="Mot de passe (8 caractères minimum)"
        value={password}
        onChangeText={setPassword}
        editable={!busy}
        secureTextEntry
      />
      <Bouton
        titre="Ajouter"
        disabled={busy}
        onPress={() => {
          if (utilisateur)
            void executer(async () => {
              await ajouterEnseignant(utilisateur, email, password, nom);
              setNom('');
              setEmail('');
              setPassword('');
              etat.recharger();
              Alert.alert('Enseignant ajouté');
            });
        }}
      />
      <Etat {...etat} />
      {!etat.loading &&
        !etat.erreur &&
        etat.donnees?.enseignants.map((e) => (
          <View key={e.email} style={ui.carte}>
            <Text style={ui.texte}>{e.nom}</Text>
            <Text style={ui.discret}>{e.email}</Text>
          </View>
        ))}
    </Page>
  );
}
