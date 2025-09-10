import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArPLiPQiYUG_uGFiCeqn3D73ogNteMpdM",
  authDomain: "diabetespredictor-a53ad.firebaseapp.com",
  projectId: "diabetespredictor-a53ad",
  storageBucket: "diabetespredictor-a53ad.firebasestorage.app",
  messagingSenderId: "113306250605",
  appId: "1:113306250605:web:94bf1fcf2682fdc6923e64",
  measurementId: "G-GD66B965F1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
