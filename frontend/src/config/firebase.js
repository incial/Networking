import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5aCij4KpiGkNbo8xxVVjYfFwxG7ZmDGI",
  authDomain: "event-networking-platform.firebaseapp.com",
  projectId: "event-networking-platform",
  storageBucket: "event-networking-platform.firebasestorage.app",
  messagingSenderId: "359926323647",
  appId: "1:359926323647:web:893893118203d6dde6e90a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
