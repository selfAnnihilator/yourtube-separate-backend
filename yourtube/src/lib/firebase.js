import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCypA1gN9qbFsG6XyMe08l7S7tGRLd_5Ag",
  authDomain: "yourtube-20056.firebaseapp.com",
  projectId: "yourtube-20056",
  storageBucket: "yourtube-20056.firebasestorage.app",
  messagingSenderId: "758701310553",
  appId: "1:758701310553:web:5192effd5629b23d336748",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
