// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
    apiKey: "AIzaSyDUFH6TDtO_2wMl3Xn7rJf890TKApi6FD4",
    authDomain: "commy-f812a.firebaseapp.com",
    databaseURL: "https://commy-f812a-default-rtdb.firebaseio.com",
    projectId: "commy-f812a",
    storageBucket: "commy-f812a.firebasestorage.app",
    messagingSenderId: "288405510760",
    appId: "1:288405510760:web:499533a58315c8edce39dd",
    measurementId: "G-QR9VYFVK3J"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, firestore };
