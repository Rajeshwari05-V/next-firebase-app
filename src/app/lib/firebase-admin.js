// lib/firebase-admin.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  // Prefer GOOGLE_APPLICATION_CREDENTIALS env var (recommended):
  // export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
  // If not present, try local file "serviceAccountKey.json"
  let credential;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = admin.credential.applicationDefault();
  } else {
    const path = './serviceAccountKey.json';
    try {
      const serviceAccount = require(path);
      credential = admin.credential.cert(serviceAccount);
    } catch (e) {
      console.error('Could not load service account JSON. Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in project root.');
      throw e;
    }
  }

  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

module.exports = admin;
