// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOUAj4ZKbv_XPYYuEYLbdcZdcsHUqFM3I",
  authDomain: "next-firebase-app-c1323.firebaseapp.com",
  projectId: "next-firebase-app-c1323",
  storageBucket: "next-firebase-app-c1323.firebasestorage.app",
  messagingSenderId: "558016572056",
  appId: "1:558016572056:web:6252964fcc8f34134bfeed"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
