// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Gelecekte Firebase Authentication için

// Firebase projenizin yapılandırma bilgileri
// LÜTFEN BU BİLGİLERİ KENDİ FIREBASE PROJENİZDEN ALDIĞINIZ
// GERÇEK firebaseConfig BİLGİLERİYLE GÜNCELLEYİN!
// Ekran görüntüsünden kopyalanan değerler:
const firebaseConfig = {
  apiKey: "AIzaSyB0BTWyiuf7RrGHzYoH2ZAld-hxBp06YNQ",
  authDomain: "ickayittakip-5edjn.firebaseapp.com",
  projectId: "ickayittakip-5edjn",
  storageBucket: "ickayittakip-5edjn.appspot.com",
  messagingSenderId: "336899798809",
  appId: "1:336899798809:web:db9a94fc16233cfeb8b788"
};

let app: FirebaseApp;
let db: Firestore;
// let auth; // Gelecekte Firebase Authentication için

// console.log("Attempting to initialize Firebase with config:", firebaseConfig); // Bu logu kaldırdık.

if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Hata durumunda bir fallback sağlamak veya hatayı yeniden fırlatmak düşünülebilir.
    // Örn: throw new Error("Firebase could not be initialized due to config error.");
  }
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

// app'in başlatıldığından emin olduktan sonra db'yi al
if (app!) { // app'in null/undefined olmadığını kontrol et
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
  // Belki burada db'ye varsayılan bir değer atamak veya hata fırlatmak gerekebilir
  // db = {} as Firestore; // Geçici çözüm, ideal değil
}

// auth = getAuth(app!); // Gelecekte Firebase Authentication için app'in tanımlı olduğunu varsayarak

export { db /*, auth */ }; // db'yi ve gelecekte auth'u dışa aktarın