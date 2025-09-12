// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCp59wNZC99am13wQbOh1brOo0xVfw0KP8",
  authDomain: "artisan-assistant-demo.firebaseapp.com",
  projectId: "artisan-assistant-demo",
  storageBucket: "artisan-assistant-demo.appspot.com",
  messagingSenderId: "874036620932",
  appId: "1:874036620932:web:64bbf2d04846b4c437e4e9",
  measurementId: "G-Y7RZVGJWQC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
