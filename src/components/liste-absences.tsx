import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { Absence } from '@/data/absences';
import { Bouton, Choix, ui } from './ui/formulaire';
export function ListeAbsences({ absences }: { absences: Absence[] }) {
  const [groupe, setGroupe] = useState('');
  const options = Array.from(
    new Map(absences.map((a) => [a.groupeId, { id: a.groupeId, nom: a.groupeNom }])).values(),
  );
  const lignes = absences.filter((a) => !groupe || a.groupeId === groupe);
  return (
    <>
      {options.length > 1 && (
        <Choix
          label="Filtrer par groupe"
          options={[{ id: '', nom: 'Tous les groupes' }, ...options]}
          value={groupe}
          onChange={setGroupe}
        />
      )}
      <Text style={ui.discret}>{lignes.length} absence(s)</Text>
      {!lignes.length && <Text style={ui.texte}>Aucune absence enregistrée.</Text>}
      {lignes.map((a) => (
        <View key={a.id} style={ui.carte}>
          <Text style={ui.texte}>
            {a.etudiantNom} · {a.etudiantId}
          </Text>
          <Text style={ui.discret}>{a.groupeNom}</Text>
          <Text style={ui.texte}>
            {a.matiere} · {a.date.split('-').reverse().join('/')} à {a.heure}
          </Text>
          <Text style={ui.texte}>{a.statut}</Text>
          <Bouton
            titre="Détails de l’absence"
            onPress={() => router.push({ pathname: '/absence', params: { id: String(a.id) } })}
          />
        </View>
      ))}
    </>
  );
}
