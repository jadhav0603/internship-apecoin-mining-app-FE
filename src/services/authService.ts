import { getApp } from '@react-native-firebase/app';
import {
  createUserWithEmailAndPassword,
  getIdToken,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import apiClient from '../api/apiClient';
import { API_CONFIG, FIREBASE_CONFIG } from '../api/config';

const firebaseAuth = getAuth(getApp());

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

const unique = (values: string[]) => [...new Set(values)];

const getDevApiBaseUrls = () => {
  const urls = [API_CONFIG.BASE_URL, API_CONFIG.DEV_LAN_BASE_URL];

  if (!__DEV__) {
    return urls;
  }

  if (Platform.OS === 'android') {
    urls.push('http://10.0.2.2:5000/api');
  }

  urls.push('http://127.0.0.1:5000/api', 'http://localhost:5000/api');

  const scriptUrl = NativeModules?.SourceCode?.scriptURL as string | undefined;
  if (scriptUrl) {
    try {
      const metroHost = new URL(scriptUrl).hostname;
      if (metroHost) {
        urls.push(`http://${metroHost}:5000/api`);
      }
    } catch {
      // Ignore malformed URL and continue with static fallbacks.
    }
  }

  return unique(urls);
};

const postSync = async (baseURL: string, idToken: string) => {
  const response = await axios.post<BackendSyncResponse>(
    `${baseURL}/auth/sync`,
    { idToken },
    {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    }
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
    try {
      const response = await apiClient.post<BackendSyncResponse>('/auth/sync', { idToken });
      return response.data;
    } catch (error: any) {
      const isNetworkError = !error?.response;
      if (!isNetworkError) {
        console.error(
          `Backend sync failed (baseURL: ${API_CONFIG.BASE_URL}):`,
          error?.response?.data ?? error?.message ?? error
        );
        throw error;
      }

      let lastError = error;
      const fallbackUrls = getDevApiBaseUrls().filter(url => url !== API_CONFIG.BASE_URL);

      for (const baseURL of fallbackUrls) {
        try {
          const data = await postSync(baseURL, idToken);
          console.log(`Backend sync succeeded via fallback baseURL: ${baseURL}`);
          return data;
        } catch (fallbackError: any) {
          lastError = fallbackError;
        }
      }

      console.error(
        `Backend sync failed on all base URLs: ${getDevApiBaseUrls().join(', ')}`,
        lastError?.response?.data ?? lastError?.message ?? lastError
      );
      throw lastError;
    }
  },

  /**
   * Log out the current user
   */
  async signOut() {
    try {
      await GoogleSignin.signOut();
    } catch {
      // No-op: user may not be signed in with Google.
    }

    return firebaseSignOut(firebaseAuth);
  },
};
