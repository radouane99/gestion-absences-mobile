import { useState } from 'react';
import { Text, View } from 'react-native';
import type { Statistique } from '@/data/absences';
import { Choix, ui } from './ui/formulaire';
export function Statistiques({ lignes }: { lignes: Statistique[] }) {
  const [groupe, setGroupe] = useState('');
  const options = Array.from(
    new Map(lignes.map((s) => [s.groupeId, { id: s.groupeId, nom: s.groupeNom }])).values(),
  );
  const selection = lignes.filter((s) => !groupe || s.groupeId === groupe);
  const total = selection.reduce((n, s) => n + s.total, 0);
  const abs = selection.reduce((n, s) => n + s.absences, 0);
  return (
    <>
      <Text style={ui.discret}>
        Une absence est comptée « justifiée » après acceptation du justificatif. Un dépôt en attente
        n’est pas encore accepté.
      </Text>
      <Text style={ui.discret}>
        Taux = absences / séances commencées auxquelles l’étudiant était inscrit × 100. Les absences
        justifiées restent incluses. Une séance planifiée est considérée tenue à son heure de début.
      </Text>
      {options.length > 1 && (
        <Choix
          label="Groupe"
          options={[{ id: '', nom: 'Tous les groupes' }, ...options]}
          value={groupe}
          onChange={setGroupe}
        />
      )}
      <Text style={ui.texte}>
        Total : {abs} absence(s) · taux global pondéré :{' '}
        {total ? `${Math.round((abs / total) * 1000) / 10} %` : 'Non calculable'}
      </Text>
      {!selection.length && <Text style={ui.texte}>Aucun étudiant.</Text>}
      {selection.map((s) => (
        <View key={s.id} style={ui.carte}>
          <Text style={ui.texte}>
            {s.nom} · {s.id}
          </Text>
          <Text style={ui.discret}>{s.groupeNom}</Text>
          <Text style={ui.texte}>
            {s.absences} absence(s), dont {s.justifiees} justifiée(s) / {s.total} séance(s)
          </Text>
          <Text style={ui.texte}>Taux : {s.taux === null ? 'Non calculable' : `${s.taux} %`}</Text>
        </View>
      ))}
    </>
  );
}
