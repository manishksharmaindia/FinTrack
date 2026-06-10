import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { firestoreDB } from './firebase';
import { useAuth } from './AuthContext';
import { decryptData } from './crypto';

export function useFirestoreQuery<T>(collectionName: string, _queryConstraints: any[] = []): T[] | undefined {
  const [data, setData] = useState<T[] | undefined>(undefined);
  const { user, encryptionKey } = useAuth();
  const hasReceivedServerData = useRef(false);

  useEffect(() => {
    if (!user || !encryptionKey) {
      setData(undefined);
      hasReceivedServerData.current = false;
      return;
    }

    const docRef = doc(firestoreDB, 'users', user.uid);
    hasReceivedServerData.current = false;

    // Do an initial server fetch to ensure we have the latest data,
    // especially important on a new browser where cache is empty.
    getDoc(docRef).then(async (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setData([]);
          return;
        }
        const docData = snapshot.data();
        const encrypted = docData[collectionName];
        if (!encrypted) {
          setData([]);
          return;
        }
        const decrypted = await decryptData(encrypted);
        setData(decrypted);
        hasReceivedServerData.current = true;
      } catch (err) {
        console.error(`Error in initial fetch for ${collectionName}:`, err);
      }
    }).catch(err => {
      console.error(`Initial getDoc failed for ${collectionName}:`, err);
    });

    // Set up real-time listener for ongoing updates.
    // includeMetadataChanges helps us distinguish cache vs server data.
    const unsubscribe = onSnapshot(
      docRef,
      { includeMetadataChanges: true },
      async (snapshot) => {
        try {
          const fromCache = snapshot.metadata.fromCache;

          if (!snapshot.exists()) {
            // Only set empty if this is from server (not a stale cache miss)
            if (!fromCache) {
              setData([]);
              hasReceivedServerData.current = true;
            }
            return;
          }

          const docData = snapshot.data();
          const encrypted = docData[collectionName];

          if (!encrypted) {
            if (!fromCache) {
              setData([]);
              hasReceivedServerData.current = true;
            }
            return;
          }

          const decrypted = await decryptData(encrypted);
          setData(decrypted);
          if (!fromCache) {
            hasReceivedServerData.current = true;
          }
        } catch (err) {
          console.error(`Error decrypting collection ${collectionName}:`, err);
          // Only set empty on decryption error if we haven't received good server data yet
          if (!hasReceivedServerData.current) {
            setData([]);
          }
        }
      },
      (error) => {
        console.error(`Firestore listener error for ${collectionName}:`, error);
      }
    );

    return () => unsubscribe();
  }, [user, encryptionKey, collectionName]);

  return data;
}
