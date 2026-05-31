import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBnTvi-mMeUgjWvEMJhn75vXMl5_2KrAMY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cuet-bus-ticket.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cuet-bus-ticket',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cuet-bus-ticket.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '429784589010',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:429784589010:web:2dcd0053ba366c12d4c30b',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-FLP483W90E',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
