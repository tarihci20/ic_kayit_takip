// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Gelecekte Firebase Authentication için

// Firebase projenizin yapılandırma bilgileri
// LÜTFEN BU BİLGİLERİ KENDİ FIREBASE PROJENİZDEN ALDIĞINIZ
// GERÇEK firebaseConfig BİLGİLERİYLE GÜNCELLEYİN!
const firebaseConfig = {
  apiKey: "AIzaSyB0BTWyiuf7RrGHzYoH2ZAld-hxBp06YNQ",
  authDomain: "ickayittakip-5edjn.firebaseapp.com",
  projectId: "ickayittakip-5edjn",
  storageBucket: "ickayittakip-5edjn.appspot.com", // Ekran görüntüsüne göre güncellendi
  messagingSenderId: "336899798809",
  appId: "1:336899798809:web:db9a94fc16233cfeb8b788"
};

let app: FirebaseApp;
let db: Firestore;
// let auth; // Gelecekte Firebase Authentication için

if (getApps().length === 0) {
  try {
    console.log("Attempting to initialize Firebase with config:", firebaseConfig);
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Hata durumunda bir fallback sağlamak veya hatayı yeniden fırlatmak düşünülebilir.
  }
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

// app'in başlatıldığından emin olduktan sonra db'yi al
if (app!) {
  try {
    db = getFirestore(app);
    console.log("Firestore instance created.");
  } catch (error) {
    console.error("Error creating Firestore instance:", error);
     // db'ye bir fallback değeri atamak veya bir hata fırlatmak gerekebilir.
     // Örneğin: throw new Error("Firestore could not be initialized.");
  }
} else {
  console.error("Firebase app is not initialized. Firestore cannot be accessed.");
}

// auth = getAuth(app!); // Gelecekte Firebase Authentication için app'in tanımlı olduğunu varsayarak

export { db /*, auth */ };
