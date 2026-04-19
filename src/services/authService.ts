import { getApp } from '@react-native-firebase/app';
import {
  createUserWithEmailAndPassword,
  FirebaseAuthTypes,
  getIdToken,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import apiClient from '../api/apiClient';
import { FIREBASE_CONFIG } from '../api/config';

const firebaseAuth = getAuth(getApp());
let authRestorePromise: Promise<FirebaseAuthTypes.User | null> | null = null;

// Configure Google Sign-In once
GoogleSignin.configure({
  webClientId: FIREBASE_CONFIG.WEB_CLIENT_ID,
});

type SyncedUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
};

type BackendSyncResponse = {
  message: string;
  user: SyncedUser;
};

const resetGoogleSignInSession = async () => {
  // This package version does not expose `prompt: 'select_account'`,
  // so we clear the cached Google session before every sign-in attempt.
  if (!GoogleSignin.hasPreviousSignIn()) {
    return;
  }

  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore cached-session cleanup failures and continue with interactive sign-in.
  }
};

const getGoogleIdToken = async (): Promise<string> => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await resetGoogleSignInSession();

  const signInResult = await GoogleSignin.signIn();
  if (signInResult.type !== 'success') {
    throw new Error('Google sign-in was cancelled.');
  }

  if (signInResult.data.idToken) {
    return signInResult.data.idToken;
  }

  // Some Android setups return the ID token only through getTokens().
  const tokens = await GoogleSignin.getTokens();
  if (tokens.idToken) {
    return tokens.idToken;
  }

  throw new Error(
    'Google Sign-In did not return an ID token. Verify WEB_CLIENT_ID and Android SHA keys in Firebase.'
  );
};

export const authService = {
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return firebaseAuth.currentUser;
  },

  async waitForAuthRestore(): Promise<FirebaseAuthTypes.User | null> {
    if (firebaseAuth.currentUser) {
      return firebaseAuth.currentUser;
    }

    if (!authRestorePromise) {
      authRestorePromise = new Promise(resolve => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, user => {
          unsubscribe();
          authRestorePromise = null;
          resolve(user);
        });
      });
    }

    return authRestorePromise;
  },

  /**
   * Register a new user with email and password
   */
  async signUp(email: string, password: string): Promise<BackendSyncResponse> {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
    const idToken = await getIdToken(userCredential.user);

    // Sync with backend
    return this.syncWithBackend(idToken);
  },

  /**
   * Log in an existing user with email and password
   */
  async signIn(email: string, password: string): Promise<BackendSyncResponse> {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    const idToken = await getIdToken(userCredential.user);

    // Sync with backend
    return this.syncWithBackend(idToken);
  },

  /**
   * Perform Google Sign-In and sync with backend
   */
  async googleSignIn(): Promise<BackendSyncResponse> {
    // 1. Get Google ID token
    const googleIdToken = await getGoogleIdToken();

    // 2. Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(googleIdToken);

    // 3. Sign-in the user with the credential
    const userCredential = await signInWithCredential(firebaseAuth, googleCredential);

    // 4. Get Firebase ID Token (for our backend)
    const firebaseIdToken = await getIdToken(userCredential.user);

    // 5. Sync with backend
    return this.syncWithBackend(firebaseIdToken);
  },

  /**
   * Sync Firebase session with MongoDB backend
   */
  async syncWithBackend(idToken: string): Promise<BackendSyncResponse> {
    const response = await apiClient.post<BackendSyncResponse>('/auth/sync', { idToken });
    return response.data;
  },

  /**
   * Log out the current user
   */
  async signOut() {
    authRestorePromise = null;
    try {
      await GoogleSignin.signOut();
    } catch {
      // No-op: user may not be signed in with Google.
    }

    return firebaseSignOut(firebaseAuth);
  },
};
