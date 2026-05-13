import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwrzJEZY23GvagRnaDX7YzU3f9ZsA7Lbg",
  authDomain: "justpick-9907b.firebaseapp.com",
  projectId: "justpick-9907b",
  storageBucket: "justpick-9907b.firebasestorage.app",
  messagingSenderId: "51099805431",
  appId: "1:51099805431:web:70eb0df5808a73688995f2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
