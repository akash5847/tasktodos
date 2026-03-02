import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 1. Must import this

const firebaseConfig = {
  apiKey: "AIzaSyBtdcErwed-J-7C0QeCEL68Z__jbWpyYGE",
  authDomain: "shopping-cart-f16c3.firebaseapp.com",
  databaseURL: "https://shopping-cart-f16c3-default-rtdb.firebaseio.com",
  projectId: "shopping-cart-f16c3",
  storageBucket: "shopping-cart-f16c3.firebasestorage.app",
  messagingSenderId: "413340791993",
  appId: "1:413340791993:web:c69ba579dd8aa09a9ad768",
};

// 2. Initialize App
const app = initializeApp(firebaseConfig);

// 3. Initialize Firestore Database
const db = getFirestore(app);

// 4. Critical: Export db so signup.jsx can see it
export const firebaseConfigError = null;
export { db };
export default db;
