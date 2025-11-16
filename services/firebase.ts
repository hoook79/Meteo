import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBXA-0nmNrPTtR7ivEHxiasps4W_wjMuq",
  authDomain: "meteo-rt.firebaseapp.com",
  projectId: "meteo-rt",
  storageBucket: "meteo-rt.appspot.com",
  messagingSenderId: "731281240630",
  appId: "1:731281240630:web:4e4ffe2856602d35c7de97"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
