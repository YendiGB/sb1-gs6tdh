import { initializeApp, FirebaseApp, FirebaseError } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, FirebaseStorage, ref, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: 'mpmf-9c91e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let isInitialized = false;

// Function to ensure user has proper role in Firestore
async function ensureUserRole(user: User) {
  if (!db) return;

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Check if this is the first user
    const metadataRef = doc(db, 'metadata', 'users');
    const metadataDoc = await getDoc(metadataRef);
    const isFirstUser = !metadataDoc.exists();
    
    // Create user document
    await setDoc(userRef, {
      email: user.email,
      role: isFirstUser ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      membershipType: 'free',
      purchasedBooks: [],
      purchasedChallenges: []
    });

    if (isFirstUser) {
      // Create metadata document for first user
      await setDoc(metadataRef, {
        totalUsers: 1,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  // Force token refresh to get latest custom claims
  await user.getIdToken(true);
}

// Function to verify storage access
async function verifyStorageAccess(): Promise<boolean> {
  if (!storage || !auth?.currentUser) return false;

  try {
    console.log('Verifying storage access...');
    console.log('Storage bucket:', storage.app.options.storageBucket);
    console.log('Current user:', auth.currentUser.uid);

    const testRef = ref(storage, 'test/access-check.txt');
    const testContent = new Blob(['Storage access test'], { type: 'text/plain' });
    
    console.log('Attempting to upload test file...');
    await uploadBytes(testRef, testContent);
    console.log('✅ Storage access verified');
    return true;
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('❌ Storage access verification failed:', {
        code: error.code,
        message: error.message,
        serverResponse: error.customData?.serverResponse
      });
    } else {
      console.error('❌ Storage access verification failed:', error);
    }
    return false;
  }
}

async function initializeFirebase() {
  if (isInitialized) return true;

  try {
    // Initialize Firebase app
    if (!app) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    }

    // Initialize Authentication
    if (!auth) {
      auth = getAuth(app);
      console.log('✅ Firebase Auth initialized');
    }

    // Initialize Firestore
    if (!db) {
      db = getFirestore(app);
      console.log('✅ Firebase Firestore initialized');

      try {
        await enableIndexedDbPersistence(db);
        console.log('✅ Firestore persistence enabled');
      } catch (err) {
        if (err instanceof FirebaseError) {
          if (err.code === 'failed-precondition') {
            console.warn('⚠️ Multiple tabs open, persistence enabled in first tab only');
          } else if (err.code === 'unimplemented') {
            console.warn('⚠️ Current browser does not support persistence');
          }
        }
      }
    }

    // Initialize Storage
    if (!storage) {
      storage = getStorage(app);
      console.log('✅ Firebase Storage initialized');
      console.log('Storage bucket:', storage.app.options.storageBucket);
    }

    // Set up auth state listener
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        await ensureUserRole(user);
        await verifyStorageAccess();
      } else {
        console.log('No user authenticated');
      }
    });

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    isInitialized = false;
    throw error;
  }
}

// Initialize Firebase and export the initialized status
export const isFirebaseInitialized = initializeFirebase();

// Export services
export { app, auth, db, storage };