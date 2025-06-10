import { initializeApp, getApps } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { auriClient } from './index';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if it hasn't been initialized
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let auth = getAuth(app);

// Initialize Analytics only on client side and only once
let analytics = null;
if (typeof window !== 'undefined' && !window.firebaseAnalytics) {
    analytics = getAnalytics(app);
    window.firebaseAnalytics = analytics;
}

// Add type declaration for window
declare global {
    interface Window {
        firebaseAnalytics: any;
    }
}

export const signUp = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get the ID token and set it in AuriClient
        const token = await user.getIdToken();
        auriClient.setToken(token);
        
        return { user, error: null };
    } catch (error: any) {
        console.error('Signup error:', error);
        return { 
            user: null, 
            error: error.message || 'Failed to create account'
        };
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get the ID token and set it in AuriClient
        const token = await user.getIdToken();
        auriClient.setToken(token);
        
        return { user, error: null };
    } catch (error: any) {
        console.error('Signin error:', error);
        return { 
            user: null, 
            error: error.message || 'Failed to sign in'
        };
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        auriClient.setToken(''); // Clear the token
        return { error: null };
    } catch (error: any) {
        console.error('Logout error:', error);
        return { 
            error: error.message || 'Failed to sign out'
        };
    }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Get fresh token and set it in AuriClient
            const token = await user.getIdToken();
            auriClient.setToken(token);
        } else {
            auriClient.setToken(''); // Clear the token
        }
        callback(user);
    });
};