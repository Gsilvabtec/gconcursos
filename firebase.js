import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCvVkocze-dtZWoBNWFLIESD3sTslb1ifo",
  authDomain: "gconcursos-f7e54.firebaseapp.com",
  projectId: "gconcursos-f7e54",
  storageBucket: "gconcursos-f7e54.firebasestorage.app",
  messagingSenderId: "25345656550",
  appId: "1:25345656550:web:3ca056bfaa53252bb41d27",
  measurementId: "G-ZBEE3PQ2H7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
