// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Gelecekte Firebase Authentication için

// Firebase projenizin yapılandırma bilgileri
// BU BİLGİLERİ KENDİ FIREBASE PROJENİZDEN ALIP GÜNCELLEYİN!
const firebaseConfig = {
  apiKey: "AIzaSyB0BTWyiuf7RrGHzYoH2ZAld-hxBp06YNQ",
  authDomain: "ickayittakip-5edjn.firebaseapp.com",
  projectId: "ickayittakip-5edjn",
  storageBucket: "ickayittakip-5edjn.firebasestorage.app",
  messagingSenderId: "336899798809",
  appId: "1:336899798809:web:db9a94fc16233cfeb8b788"
};

let app: FirebaseApp;
let db: Firestore;
// let auth; // Gelecekte Firebase Authentication için

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
// auth = getAuth(app); // Gelecekte Firebase Authentication için

export { db /*, auth */ }; // db'yi ve gelecekte auth'u dışa aktarın
