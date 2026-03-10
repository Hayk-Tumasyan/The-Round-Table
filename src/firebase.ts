import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAIXZLZYegRadJFxvZYYWgNq-h5xCSkSbw",
  authDomain: "the-round-table-f1d77.firebaseapp.com",
  projectId: "the-round-table-f1d77",
  storageBucket: "the-round-table-f1d77.firebasestorage.app",
  messagingSenderId: "438208622266",
  appId: "1:438208622266:web:0c0517ba587792147bdc83"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// GHOST IMPORT for AdBlocker resilience
const initAnalytics = async () => {
  try {
    const analyticsModule = "firebase/analyt" + "ics"; 
    const { getAnalytics, isSupported } = await import(analyticsModule);
    const supported = await isSupported();
    if (supported) getAnalytics(app);
  } catch (err) {
    console.warn("Analytics blocked, but the realm endures.");
  }
};

initAnalytics();

export default app;