import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBFkjNEZt7Mk0XaElaln5FpwCyk3NEP9Sw",
  authDomain: "mfmed-hub.firebaseapp.com",
  projectId: "mfmed-hub",
  storageBucket: "mfmed-hub.firebasestorage.app",
  messagingSenderId: "323755417402",
  appId: "1:323755417402:web:6fb9fc89faa2c2a02bfa03",
  measurementId: "G-W1R87GELW7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper functions for easy import
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
