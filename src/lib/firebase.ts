// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Gelecekte Firebase Authentication için

// Firebase projenizin yapılandırma bilgileri
// LÜTFEN BU BİLGİLERİ KENDİ FIREBASE PROJENİZDEN ALDIĞINIZ
// GERÇEK firebaseConfig BİLGİLERİYLE GÜNCELLEYİN!
// AŞAĞIDAKİ ÖRNEK YAPILANDIRMAYI KULLANMAYIN.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Firebase Console'dan kopyalayın
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Firebase Console'dan kopyalayın
  projectId: "YOUR_PROJECT_ID", // Firebase Console'dan kopyalayın
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Firebase Console'dan kopyalayın
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Firebase Console'dan kopyalayın
  appId: "YOUR_APP_ID" // Firebase Console'dan kopyalayın
  // measurementId: "G-XXXXXXXXXX" // İsteğe bağlı, varsa ekleyebilirsiniz
};

let app: FirebaseApp;
let db: Firestore;
// let auth; // Gelecekte Firebase Authentication için

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully!");
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

db = getFirestore(app);
// auth = getAuth(app); // Gelecekte Firebase Authentication için

export { db /*, auth */ }; // db'yi ve gelecekte auth'u dışa aktarın