// Firebase Configuration for HAGAATY Platform (Connected to studio-4023689725-14a1c)

const firebaseConfig = {
    apiKey: "AIzaSyDN-loxl-9NXblYyWNmvWYfOfnpb03LbPs",
    authDomain: "studio-4023689725-14a1c.firebaseapp.com",
    projectId: "studio-4023689725-14a1c",
    storageBucket: "studio-4023689725-14a1c.firebasestorage.app",
    messagingSenderId: "516122529462",
    appId: "1:516122529462:web:6690a1ace2677742fde017"
};

// Initialize Firebase App if Firebase SDK is loaded
let firebaseApp, auth, db;

try {
    if (typeof firebase !== 'undefined') {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log("🔥 Firebase Project (studio-4023689725-14a1c) initialized successfully!");
    } else {
        console.warn("⚠️ Firebase SDK not loaded.");
    }
} catch (e) {
    console.error("Firebase init error:", e);
}
