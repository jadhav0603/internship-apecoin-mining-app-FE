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
  updateProfile as firebaseUpdateProfile,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import apiClient from '../api/apiClient';
import { FIREBASE_CONFIG, API_CONFIG, getDevApiBaseUrls } from '../api/config';

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
  plan?: string;
  referredBy?: string | null;
  referralEarnings?: number;
  referralCount?: number;
};

type BackendSyncResponse = {
  message: string;
  user: SyncedUser;
};

const signOutFromProviders = async () => {
  try {
    await GoogleSignin.signOut();
  } catch {
    // No-op: user may not be signed in with Google.
  }

  if (firebaseAuth.currentUser) {
    await firebaseSignOut(firebaseAuth);
  }
};

const syncWithBackendRequest = async (
  idToken: string
): Promise<BackendSyncResponse> => {
  try {
    const response = await apiClient.post<BackendSyncResponse>('/auth/sync', { idToken });
    return response.data;
  } catch (error: any) {
    const isNetworkError = !error?.response;
    if (!isNetworkError) {
      if (__DEV__) {
        console.log(
          `Backend sync failed (baseURL: ${API_CONFIG.BASE_URL}):`,
          error?.response?.data ?? error?.message ?? error
        );
      }
      throw error;
    }

    let lastError = error;
    const fallbackUrls = getDevApiBaseUrls().filter((url: string) => url !== API_CONFIG.BASE_URL);

    for (const baseURL of fallbackUrls) {
      try {
        const data = await postSync(baseURL, idToken);
        if (__DEV__) {
          console.log(`Backend sync succeeded via fallback baseURL: ${baseURL}`);
        }
        return data;
      } catch (fallbackError: any) {
        lastError = fallbackError;
      }
    }

    if (__DEV__) {
      console.log(
        `Backend sync failed on all base URLs: ${getDevApiBaseUrls().join(', ')}`,
        lastError?.response?.data ?? lastError?.message ?? lastError
      );
    }
    throw lastError;
  }
};

const syncFirebaseSession = async (
  user: FirebaseAuthTypes.User,
  options?: { rollbackOnFailure?: boolean }
): Promise<BackendSyncResponse> => {
  const idToken = await getIdToken(user, true);

  try {
    return await syncWithBackendRequest(idToken);
  } catch (error) {
    if (options?.rollbackOnFailure) {
      await signOutFromProviders().catch(() => undefined);
    }

    throw error;
  }
};

const postSync = async (baseURL: string, idToken: string) => {
  const response = await apiClient.post<BackendSyncResponse>(
    `${baseURL}/auth/sync`,
    { idToken }
  );
  return response.data;
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
  async signUp(email: string, password: string): Promise<FirebaseAuthTypes.User> {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
    return userCredential.user;
  },

  /**
   * Log in an existing user with email and password
   */
  async signIn(email: string, password: string): Promise<FirebaseAuthTypes.User> {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    return userCredential.user;
  },

  /**
   * Perform Google Sign-In and sync with backend
   */
  async googleSignIn(): Promise<FirebaseAuthTypes.User> {
    // 1. Get Google ID token
    const googleIdToken = await getGoogleIdToken();

    // 2. Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(googleIdToken);

    // 3. Sign-in the user with the credential
    const userCredential = await signInWithCredential(firebaseAuth, googleCredential);

    return userCredential.user;
  },

  async syncCurrentSession(
    options?: { rollbackOnFailure?: boolean }
  ): Promise<BackendSyncResponse | null> {
    const user = firebaseAuth.currentUser ?? (await this.waitForAuthRestore());

    if (!user) {
      return null;
    }

    return syncFirebaseSession(user, options);
  },

  /**
   * Sync Firebase session with MongoDB backend
   */
  async syncWithBackend(idToken: string): Promise<BackendSyncResponse> {
    return syncWithBackendRequest(idToken);
  },

  /**
   * Log out the current user
   */
  async signOut() {
    try {
      await apiClient.post('/mining/stop', undefined, {
        skipAutoSignOut: true,
      } as any);
    } catch (error) {
      if (__DEV__) {
        console.log(
          'Failed to stop mining session before sign-out:',
          error
        );
      }
    }

    return signOutFromProviders();
  },

  async deleteAccount() {
    await apiClient.delete('/users/me');
    await signOutFromProviders();
  },

  /**
   * Update the current user's profile information
   */
  async updateProfile(updates: { displayName?: string; photoURL?: string }) {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error('No user signed in');
    }

    await firebaseUpdateProfile(user, updates);
    
    // Force a token refresh and sync with backend to ensure MongoDB is updated too
    const idToken = await getIdToken(user, true);
    await syncWithBackendRequest(idToken);
    
    return user;
  },
};
