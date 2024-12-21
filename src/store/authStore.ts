import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserData {
  id: string;
  email: string;
  role: 'user' | 'admin';
  membershipType: 'free' | 'premium' | 'unlimited';
  purchasedBooks: string[];
  purchasedChallenges: string[];
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not initialized');
      }

      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }

      const userRef = doc(db, 'users', userCredential.user.uid);
      let userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document with admin role for the first user
        const isFirstUser = (await getDoc(doc(db, 'metadata', 'users'))).exists() === false;
        
        const userData = {
          email: userCredential.user.email,
          role: isFirstUser ? 'admin' : 'user',
          membershipType: 'free',
          purchasedBooks: [],
          purchasedChallenges: [],
          createdAt: new Date().toISOString()
        };

        await setDoc(userRef, userData);

        if (isFirstUser) {
          await setDoc(doc(db, 'metadata', 'users'), {
            totalUsers: 1,
            lastUpdated: new Date().toISOString()
          });
        }

        userDoc = await getDoc(userRef);
      }

      const userData: UserData = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        ...userDoc.data()
      } as UserData;

      // Set custom claims based on user role
      const customClaims = {
        admin: userData.role === 'admin'
      };

      // Force token refresh to update claims
      await userCredential.user.getIdToken(true);

      set({ 
        user: userCredential.user, 
        userData, 
        loading: false,
        error: null 
      });
    } catch (error) {
      console.error('Sign in error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in',
        loading: false,
        user: null,
        userData: null
      });
    }
  },

  signOut: async () => {
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not initialized');
      }

      await firebaseSignOut(auth);
      set({ user: null, userData: null, error: null });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out',
        user: null,
        userData: null
      });
    }
  },

  initialize: () => {
    if (!auth || !db) {
      set({ loading: false, error: 'Firebase is not properly initialized' });
      return;
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            set({ 
              user: null, 
              userData: null, 
              loading: false,
              error: 'User data not found' 
            });
            return;
          }

          const userData: UserData = {
            id: user.uid,
            email: user.email || '',
            ...userDoc.data()
          } as UserData;

          // Set custom claims based on user role
          const customClaims = {
            admin: userData.role === 'admin'
          };

          // Force token refresh to update claims
          await user.getIdToken(true);

          set({ 
            user, 
            userData, 
            loading: false,
            error: null 
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load user data',
            loading: false,
            user: null,
            userData: null 
          });
        }
      } else {
        set({ 
          user: null, 
          userData: null, 
          loading: false,
          error: null 
        });
      }
    });
  }
}));