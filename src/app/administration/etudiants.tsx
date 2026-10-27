import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Bouton, Champ, Choix, Etat, Page, ui } from '@/components/ui/formulaire';
import { catalogue, sauverEtudiant, type Etudiant } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
import { useAction } from '@/hooks/use-action';
const vide: Etudiant = { id: '', nom: '', groupeId: '' };
export default function EtudiantsScreen() {
  const etat = useDonnees(catalogue);
  const { utilisateur } = useSession();
  const { busy, executer } = useAction();
  const [etudiant, setEtudiant] = useState(vide);
  const [nouveau, setNouveau] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  function reset() {
    setEtudiant(vide);
    setNouveau(true);
    setEmail('');
    setPassword('');
  }
  function sauver() {
    if (utilisateur)
      void executer(async () => {
        await sauverEtudiant(utilisateur, etudiant, nouveau, email, password);
        reset();
        etat.recharger();
        Alert.alert('Étudiant enregistré');
      });
  }
  return (
    <Page>
      <Text style={ui.titre}>{nouveau ? 'Ajouter un étudiant' : 'Modifier un étudiant'}</Text>
      <Champ
        label="Matricule"
        value={etudiant.id}
        editable={nouveau && !busy}
        maxLength={30}
        onChangeText={(id) => setEtudiant({ ...etudiant, id })}
      />
      <Champ
        label="Nom complet"
        value={etudiant.nom}
        editable={!busy}
        maxLength={100}
        onChangeText={(nom) => setEtudiant({ ...etudiant, nom })}
      />
      <Etat {...etat} />
      {!etat.loading && !etat.erreur && (
        <>
          <Choix
            label="Groupe"
            options={etat.donnees?.groupes ?? []}
            value={etudiant.groupeId}
            disabled={busy}
            onChange={(groupeId) => setEtudiant({ ...etudiant, groupeId })}
          />
          {nouveau && (
            <>
              <Champ
                label="Email de connexion"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!busy}
              />
              <Champ
                label="Mot de passe (8 caractères minimum)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!busy}
              />
            </>
          )}
          <Bouton titre="Enregistrer" disabled={busy} onPress={sauver} />
          {!nouveau && <Bouton titre="Annuler" disabled={busy} onPress={reset} />}
          <Text style={ui.titre}>Étudiants</Text>
          {etat.donnees?.etudiants.map((e) => (
            <View key={e.id} style={ui.carte}>
              <Text style={ui.texte}>
                {e.id} · {e.nom}
              </Text>
              <Text style={ui.discret}>
                {etat.donnees?.groupes.find((g) => g.id === e.groupeId)?.nom}
              </Text>
              <Bouton
                titre="Modifier"
                disabled={busy}
                onPress={() => {
                  setEtudiant(e);
                  setNouveau(false);
                  setPassword('');
                }}
              />
            </View>
          ))}
        </>
      )}
    </Page>
  );
}
