import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import type { Compte } from './demo';

const SessionContext = createContext<{
  utilisateur: Compte | null;
  setUtilisateur: (compte: Compte | null) => void;
}>({ utilisateur: null, setUtilisateur: () => {} });
export function SessionProvider({ children }: PropsWithChildren) {
  const [utilisateur, setUtilisateur] = useState<Compte | null>(null);
  return (
    <SessionContext.Provider value={{ utilisateur, setUtilisateur }}>
      {children}
    </SessionContext.Provider>
  );
}
export const useSession = () => useContext(SessionContext);
