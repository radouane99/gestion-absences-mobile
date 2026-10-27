import { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { Choix, Etat, Page, ui } from '@/components/ui/formulaire';
import { ListeAbsences } from '@/components/liste-absences';
import { listerAbsences } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
const options = [
  { id: '', nom: 'Toutes les absences' },
  { id: 'En attente', nom: 'Justificatifs en attente' },
  { id: 'Accepté', nom: 'Acceptés / absences justifiées' },
  { id: 'Refusé', nom: 'Refusés' },
  { id: 'Non justifiée', nom: 'Sans justificatif' },
];
export default function JustificatifsScreen() {
  const { utilisateur } = useSession();
  const [statut, setStatut] = useState('En attente');
  const charger = useCallback(
    () =>
      utilisateur?.role === 'Administrateur' ? listerAbsences(utilisateur) : Promise.resolve([]),
    [utilisateur],
  );
  const etat = useDonnees(charger);
  return (
    <Page>
      <Text style={ui.titre}>Absences et justificatifs</Text>
      <Text style={ui.discret}>
        Un dépôt est « En attente ». L’absence devient justifiée après acceptation par l’enseignant
        ou l’administration.
      </Text>
      <Choix label="Statut" options={options} value={statut} onChange={setStatut} />
      <Etat {...etat} />
      {!etat.loading && !etat.erreur && (
        <ListeAbsences
          key={statut}
          absences={(etat.donnees ?? []).filter((a) => !statut || a.statut === statut)}
        />
      )}
    </Page>
  );
}
