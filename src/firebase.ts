import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUyHSOitCfNUkHZKuJNSyVJIiE5JjrXcw",
  authDomain: "fintrack-36ac3.firebaseapp.com",
  projectId: "fintrack-36ac3",
  storageBucket: "fintrack-36ac3.firebasestorage.app",
  messagingSenderId: "360720959920",
  appId: "1:360720959920:web:14b995673f2ea35e1d2e75",
  measurementId: "G-2G06YY2VCT"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestoreDB = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});
