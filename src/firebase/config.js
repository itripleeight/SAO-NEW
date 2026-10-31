// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBl7zHT4fBE9DS1w_n-sROvD09Cp3G9v8s",
  authDomain: "shawaramaalley.firebaseapp.com",
  projectId: "shawaramaalley",
  storageBucket: "shawaramaalley.firebasestorage.app",
  messagingSenderId: "187631446838",
  appId: "1:187631446838:web:df69f08b1fd386d749a197"
};

console.log('🔧 Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPresent: !!firebaseConfig.apiKey
});

// Initialize Firebase
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  // Initialize Auth
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
  
  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export { db, auth };
export default app;