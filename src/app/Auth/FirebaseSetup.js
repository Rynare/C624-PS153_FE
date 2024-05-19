// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

/* eslint-disable */
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY
const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET
const FIREBASE_MESSAGING_SENDER_ID = process.env.FIREBASE_MESSAGING_SENDER_ID
const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID
const FIREBASE_MEASUREMENT_ID = process.env.FIREBASE_MEASUREMENT_ID
/* eslint-enable */

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// const auth = getAuth();
// const googleProvider = new GoogleAuthProvider();

export { firebaseConfig };
