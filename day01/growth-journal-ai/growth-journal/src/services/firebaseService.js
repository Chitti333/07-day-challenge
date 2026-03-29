import { initializeApp } from 'firebase/app'
import {
    getAuth, signInWithPopup,
    GoogleAuthProvider, signOut, onAuthStateChanged
} from 'firebase/auth'
import {
    getFirestore, collection, addDoc,
    getDocs, orderBy, query, doc, getDoc
} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

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