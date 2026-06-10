import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { setGlobalKey } from './crypto';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  encryptionKey: CryptoKey | null;
  setEncryptionKey: (key: CryptoKey | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  encryptionKey: null,
  setEncryptionKey: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  const updateEncryptionKey = (key: CryptoKey | null) => {
    setEncryptionKey(key);
    setGlobalKey(key);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        updateEncryptionKey(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, encryptionKey, setEncryptionKey: updateEncryptionKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
