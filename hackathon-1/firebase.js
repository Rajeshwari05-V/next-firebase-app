// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGGPs4yqcINN226Mhn1t3Yxbe0QHuKrf8",
  authDomain: "artisan-assistant-demo.firebaseapp.com",
  projectId: "artisan-assistant-demo",
  storageBucket: "artisan-assistant-demo.firebasestorage.app",
  messagingSenderId: "264886618777",
  appId: "1:264886618777:web:44400a6bbd42fc8f4d4608",
  measurementId: "G-YFVRZ9GXGW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
