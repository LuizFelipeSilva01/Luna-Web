//inicializando e conectadando o firebase  
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVLFnvRVCKU2DmrW30-Cl6hZ22kxCM22g",
  authDomain: "luna-d050c.firebaseapp.com",
  databaseURL: "https://luna-d050c-default-rtdb.firebaseio.com",
  projectId: "luna-d050c",
  storageBucket: "luna-d050c.firebasestorage.app",
  messagingSenderId: "557586514299",
  appId: "1:557586514299:web:63633cc25e322c1f73bdde",
  measurementId: "G-XM4E1LV396"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const UID_ADMIN = "5AknnLYNDDX5mwF2dEKrNsyUIBk2";