import { useCallback } from 'react';
import { Text } from 'react-native';
import { Etat, Page, ui } from '@/components/ui/formulaire';
import { ListeAbsences } from '@/components/liste-absences';
import { listerAbsences } from '@/data/absences';
import { useSession } from '@/data/session';
import { useDonnees } from '@/hooks/use-donnees';
export default function HistoriqueScreen() {
  const { utilisateur } = useSession();
  const charger = useCallback(
    () => (utilisateur ? listerAbsences(utilisateur) : Promise.resolve([])),
    [utilisateur],
  );
  const etat = useDonnees(charger);
  return (
    <Page>
      <Text style={ui.titre}>Absences enregistrées</Text>
      <Etat {...etat} />
      {!etat.loading && !etat.erreur && <ListeAbsences absences={etat.donnees ?? []} />}
    </Page>
  );
}
