import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMG2N2dFUoyagfZUSsqjQiZ9sQoGwiJDA",
  authDomain: "trends-networking-app.firebaseapp.com",
  databaseURL: "https://trends-networking-app-default-rtdb.firebaseio.com",
  projectId: "trends-networking-app",
  storageBucket: "trends-networking-app.firebasestorage.app",
  messagingSenderId: "535127266710",
  appId: "1:535127266710:web:ef100d3ebf59cb5b8879b7",
  measurementId: "G-KSXRFEHY9K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export default app;
