// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
  apiKey: "AIzaSyAhfbA3si_4inTjJl5LB8chK52EVu4eP5Q",
  authDomain: "proyectos-6c15c.firebaseapp.com",
  databaseURL: "https://proyectos-6c15c-default-rtdb.firebaseio.com",
  projectId: "proyectos-6c15c",
  storageBucket: "proyectos-6c15c.firebasestorage.app",
  messagingSenderId: "1008259327790",
  appId: "1:1008259327790:web:fddf59f4dad0d36d553cbf",
  measurementId: "G-D1XK1GTBR3"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, firestore };
