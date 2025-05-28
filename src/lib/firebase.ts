// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Gelecekte Firebase Authentication için

// Firebase projenizin yapılandırma bilgileri
// BU BİLGİLERİ KENDİ FIREBASE PROJENİZDEN ALIP GÜNCELLEYİN!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Google Analytics için isteğe bağlı
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
