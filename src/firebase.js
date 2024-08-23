import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBYM3qkNI2UzlYmIR4BCiPDu6DnsF5_crk",
  authDomain: "eventsyrupadmin.firebaseapp.com",
  projectId: "eventsyrupadmin",
  storageBucket: "eventsyrupadmin.appspot.com",
  messagingSenderId: "70049127537",
  appId: "1:70049127537:web:9752c83c8c282c9de44fd0",
  measurementId: "G-3QFLHLF74X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
