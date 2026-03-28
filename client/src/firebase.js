import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cuet-bus-ticket.firebaseapp.com",
  projectId: "cuet-bus-ticket",
  storageBucket: "cuet-bus-ticket.firebasestorage.app",
  messagingSenderId: "429784589010",
  appId: "1:429784589010:web:2dcd0053ba366c12d4c30b",
  measurementId: "G-FLP483W90E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
