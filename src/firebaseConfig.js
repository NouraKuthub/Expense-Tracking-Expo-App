import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let app;
let auth;

if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        // Persistence setup for React Native
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
    } catch (e) {
        console.warn("Firebase initialization failed (probably invalid config)", e);
    }
} else {
    app = getApps()[0];
    auth = getAuth(app);
}

export { auth };
export const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
