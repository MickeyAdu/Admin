// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBW9zuVeFJI4WCx-904tuI1X04EzvJo_DI",
  authDomain: "fuelme-35a6a.firebaseapp.com",
  databaseURL: "https://fuelme-35a6a-default-rtdb.firebaseio.com",
  projectId: "fuelme-35a6a",
  storageBucket: "fuelme-35a6a.appspot.com",
  messagingSenderId: "550735419093",
  appId: "1:550735419093:web:560b02af0296261315345c",
  measurementId: "G-QGXKRP2RSS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
