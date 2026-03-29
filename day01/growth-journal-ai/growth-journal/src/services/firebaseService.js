// import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js'
// import {
//     getAuth, signInWithPopup,
//     GoogleAuthProvider, signOut, onAuthStateChanged
// } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'
// import {
//     getFirestore, collection, addDoc,
//     getDocs, orderBy, query, doc, getDoc
// } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
    getAuth, signInWithPopup,
    GoogleAuthProvider, signOut, onAuthStateChanged
} from 'firebase/auth'
import {
    getFirestore, collection, addDoc,
    getDocs, orderBy, query
} from 'firebase/firestore'
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// ── Auth ──────────────────────────────────────────
export const loginWithGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider())

export const logout = () => signOut(auth)

export const onAuthChange = (callback) =>
    onAuthStateChanged(auth, callback)

export const getCurrentUser = () => auth.currentUser

// ── Entries (scoped per user) ─────────────────────
export async function saveEntry(uid, entryText, insights) {
    try {
        const ref = await addDoc(
            collection(db, 'users', uid, 'entries'),
            { entryText, insights, createdAt: new Date() }
        )
        return { success: true, id: ref.id }
    } catch (e) {
        return { success: false, error: e.message }
    }
}

export async function loadEntries(uid) {
    try {
        const q = query(
            collection(db, 'users', uid, 'entries'),
            orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate()
        }))
    } catch (e) {
        console.error(e)
        return []
    }
}

console.log('Keys loaded:', {
    firebase: firebaseConfig.apiKey?.slice(0, 8),
    openrouter: import.meta.env.VITE_OPENROUTER_API_KEY?.slice(0, 8)
})