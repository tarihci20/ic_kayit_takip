
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
  storageBucket: "ickayittakip-5edjn.firebasestorage.app",
  messagingSenderId: "336899798809",
  appId: "1:336899798809:web:db9a94fc16233cfeb8b788"
};

let app: FirebaseApp;
let db: Firestore;
// let auth; // Gelecekte Firebase Authentication için

if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Hata durumunda bir fallback sağlamak veya hatayı yeniden fırlatmak düşünülebilir.
    // Şimdilik, eğer başlatma başarısız olursa app tanımsız kalacak
    // ve db başlatma da hata verecektir.
  }
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

// app'in başlatıldığından emin olduktan sonra db'yi al
// Eğer initializeApp hata verirse app tanımsız olabilir.
// Bu durumu ele almak için bir kontrol eklenebilir.
if (app!) { // app'in null veya undefined olmadığını varsayıyoruz
  db = getFirestore(app);
} else {
  // Firebase başlatılamadıysa db tanımsız kalır.
  // Bu durumda uygulamanın nasıl davranacağına karar vermek gerekir.
  console.error("Firebase app is not initialized. Firestore cannot be accessed.");
  // db'ye bir fallback değeri atamak veya bir hata fırlatmak gerekebilir.
  // Örneğin: throw new Error("Firestore could not be initialized.");
  // Şimdilik db'yi undefined bırakıyoruz, bu da sonraki kodlarda hataya yol açacaktır.
}

// auth = getAuth(app!); // Gelecekte Firebase Authentication için app'in tanımlı olduğunu varsayarak

export { db /*, auth */ };
