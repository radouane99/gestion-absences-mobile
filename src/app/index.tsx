import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Redirect } from 'expo-router';
import { connecter } from '@/data/absences';
import { useAction } from '@/hooks/use-action';
import { useSession } from '@/data/session';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { utilisateur, setUtilisateur } = useSession();

  const { busy, executer } = useAction();

  function seConnecter() {
    if (!email.trim() || !password) {
      Alert.alert('Champs manquants', 'Saisissez votre email et votre mot de passe.');
      return;
    }

    void executer(async () => {
      const compte = await connecter(email, password);
      if (!compte) {
        Alert.alert('Connexion refusée', 'Email ou mot de passe incorrect.');
        return;
      }
      setPassword('');
      setUtilisateur(compte);
    });
  }
  if (utilisateur?.role === 'Enseignant') return <Redirect href="/enseignant" />;

  if (utilisateur?.role === 'Étudiant') return <Redirect href="/etudiant" />;
  if (utilisateur?.role === 'Administrateur') return <Redirect href="/administration" />;

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={styles.titre}>Gestion des absences</Text>
        <Text style={styles.sousTitre}>Connectez-vous à votre espace universitaire</Text>

        <View style={styles.carte}>
          <Text style={styles.titreFormulaire}>Connexion</Text>

          <Text style={styles.label}>Adresse email</Text>
          <TextInput
            style={styles.champ}
            placeholder="exemple@absence.ma"
            placeholderTextColor="#8892A2"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.champ}
            placeholder="Votre mot de passe"
            placeholderTextColor="#8892A2"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={seConnecter}
          />

          <Pressable
            style={({ pressed }) => [styles.bouton, pressed && styles.boutonAppuye]}
            disabled={busy}
            onPress={seConnecter}
          >
            <Text style={styles.texteBouton}>Se connecter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  contenu: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  titre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#183153',
    textAlign: 'center',
  },
  sousTitre: {
    fontSize: 15,
    color: '#657084',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 30,
  },
  carte: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4E8EF',
  },
  titreFormulaire: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#183153',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  champ: {
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: '#D9DFE8',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#183153',
    marginBottom: 20,
  },
  bouton: {
    backgroundColor: '#2457C5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  boutonAppuye: {
    opacity: 0.8,
  },
  texteBouton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
