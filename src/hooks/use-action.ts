import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { messageErreur } from './use-donnees';

export function useAction() {
  const [busy, setBusy] = useState(false);
  const verrou = useRef(false);
  async function executer(action: () => Promise<void>) {
    if (verrou.current) return;
    verrou.current = true;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      Alert.alert('Action impossible', messageErreur(error));
    } finally {
      verrou.current = false;
      setBusy(false);
    }
  }
  return { busy, executer };
}
