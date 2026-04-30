import axios from 'axios';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import {
  getBlockedAccount,
  getBlockedAccountFromStatus,
  setBlockedAccount,
} from '../session/blockedAccountState';

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
  status?: string;
  bannedReason?: string | null;
  plan?: string;
  referredBy?: string | null;
  referralEarnings?: number;
  referralCount?: number;
  acceptedTerms?: boolean;
};

type BackendSyncResponse = {
  message: string;
  user: SyncedUser;
};

type RecoverAccountResponse = {
  success: boolean;
  code: string;
  message: string;
  user: SyncedUser;
};

const createBlockedAccountError = (
  type: 'banned' | 'deleted',
  reason?: string | null,
) => ({
  response: {
    status: 403,
    data: {
      code: type === 'banned' ? 'ACCOUNT_BANNED' : 'ACCOUNT_DELETED',
      message:
        type === 'banned'
          ? 'Your account has been banned.'
          : 'Your account has been deleted.',
      reason: reason ?? null,
    },
  },
});

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
  idToken: string,
): Promise<BackendSyncResponse> => {
  try {
    const response = await apiClient.post<BackendSyncResponse>('/auth/sync', {
      idToken,
    });
    return response.data;
  } catch (error: any) {
    const isNetworkError = !error?.response;
    if (!isNetworkError) {
      if (__DEV__) {
        console.log(
          `Backend sync failed (baseURL: ${API_CONFIG.BASE_URL}):`,
          error?.response?.data ?? error?.message ?? error,
        );
      }
      throw error;
    }

    let lastError = error;
    const fallbackUrls = getDevApiBaseUrls().filter(
      (url: string) => url !== API_CONFIG.BASE_URL,
    );

    for (const baseURL of fallbackUrls) {
      try {
        const data = await postSync(baseURL, idToken);
        if (__DEV__) {
          console.log(
            `Backend sync succeeded via fallback baseURL: ${baseURL}`,
          );
        }
        return data;
      } catch (fallbackError: any) {
        lastError = fallbackError;
      }
    }

    if (__DEV__) {
      console.log(
        `Backend sync failed on all base URLs: ${getDevApiBaseUrls().join(
          ', ',
        )}`,
        lastError?.response?.data ?? lastError?.message ?? lastError,
      );
    }
    throw lastError;
  }
};

const syncFirebaseSession = async (
  user: FirebaseAuthTypes.User,
  options?: { rollbackOnFailure?: boolean },
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

const ensureActiveBackendAccount = async (
  user: FirebaseAuthTypes.User,
): Promise<BackendSyncResponse> => {
  const sessionToken = await getIdToken(user, true);
  const syncResponse = await syncFirebaseSession(user, {
    rollbackOnFailure: true,
  });
  const blockedAccount = getBlockedAccountFromStatus(
    syncResponse.user?.status,
    {
      source: 'login',
      email: syncResponse.user?.email ?? user.email ?? null,
      reason: syncResponse.user?.bannedReason ?? null,
    },
  );

  if (!blockedAccount) {
    return syncResponse;
  }

  setBlockedAccount({
    ...blockedAccount,
    sessionToken,
  });
  throw createBlockedAccountError(blockedAccount.type, blockedAccount.reason);
};

const postSync = async (baseURL: string, idToken: string) => {
  const response = await apiClient.post<BackendSyncResponse>(
    `${baseURL}/auth/sync`,
    { idToken },
  );
  return response.data;
};

const unique = <T>(values: T[]) => [...new Set(values)];

const getDeleteAccountBaseUrls = () => {
  const currentApiBaseUrl = apiClient.defaults.baseURL;
  return unique(
    [currentApiBaseUrl, ...getDevApiBaseUrls()].filter(Boolean) as string[],
  );
};

const isMissingDeleteRouteError = (error: any) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status !== 404) {
    return false;
  }

  if (typeof data === 'string') {
    return data.includes('Cannot DELETE /api/user/account');
  }

  return (
    typeof data?.message === 'string' &&
    data.message.includes('Cannot DELETE /api/user/account')
  );
};

const isMissingReactivateRouteError = (error: any) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status !== 404) {
    return false;
  }

  if (typeof data === 'string') {
    return data.includes('Cannot POST /api/user/account/reactivate');
  }

  return (
    typeof data?.message === 'string' &&
    data.message.includes('Cannot POST /api/user/account/reactivate')
  );
};

const deleteAccountRequest = async (token: string) => {
  let lastError: any;
  const baseUrls = getDeleteAccountBaseUrls();

  for (const baseURL of baseUrls) {
    try {
      const response = await axios.delete(`${baseURL}/user/account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      apiClient.defaults.baseURL = baseURL;
      return response.data;
    } catch (error: any) {
      lastError = error;

      if (__DEV__) {
        console.log(
          `[deleteAccount] request failed via baseURL ${baseURL}:`,
          error?.response?.data ?? error?.message ?? error,
        );
      }

      if (isMissingDeleteRouteError(error)) {
        continue;
      }

      if (error?.response) {
        throw error;
      }
    }
  }

  throw lastError;
};

const reactivateAccountRequest = async (
  email: string,
  sessionToken: string | null,
) => {
  let lastError: any;
  const baseUrls = getDeleteAccountBaseUrls();

  for (const baseURL of baseUrls) {
    try {
      const response = await axios.post(
        `${baseURL}/user/account/reactivate`,
        { email },
        {
          headers: sessionToken
            ? {
                Authorization: `Bearer ${sessionToken}`,
              }
            : undefined,
          timeout: API_CONFIG.TIMEOUT,
        },
      );

      apiClient.defaults.baseURL = baseURL;
      return response.data;
    } catch (error: any) {
      lastError = error;

      if (__DEV__) {
        console.log(
          `[reactivateAccount] request failed via baseURL ${baseURL}:`,
          error?.response?.data ?? error?.message ?? error,
        );
      }

      if (isMissingReactivateRouteError(error)) {
        continue;
      }

      if (error?.response) {
        throw error;
      }
    }
  }

  throw lastError;
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
    'Google Sign-In did not return an ID token. Verify WEB_CLIENT_ID and Android SHA keys in Firebase.',
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
  async signUp(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.User> {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email.trim(),
      password,
    );
    return userCredential.user;
  },

  /**
   * Log in an existing user with email and password
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.User> {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email.trim(),
      password,
    );
    await ensureActiveBackendAccount(userCredential.user);
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
    const userCredential = await signInWithCredential(
      firebaseAuth,
      googleCredential,
    );

    await ensureActiveBackendAccount(userCredential.user);
    return userCredential.user;
  },

  async syncCurrentSession(options?: {
    rollbackOnFailure?: boolean;
  }): Promise<BackendSyncResponse | null> {
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
  async clearSession() {
    await Promise.allSettled([AsyncStorage.clear(), signOutFromProviders()]);
  },

  async signOut() {
    try {
      await apiClient.post('/mining/stop', undefined, {
        skipAutoSignOut: true,
      } as any);
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to stop mining session before sign-out:', error);
      }
    }

    return signOutFromProviders();
  },

  async deleteAccount() {
    const token = await firebaseAuth.currentUser?.getIdToken();

    if (!token) {
      throw new Error('Unable to authenticate delete account request.');
    }

    try {
      await deleteAccountRequest(token);
    } catch (error: any) {
      console.error(
        '[deleteAccount] error.response?.data:',
        error?.response?.data,
      );

      const status = error?.response?.status;
      const code = error?.response?.data?.code;

      const isAlreadyDeletedState =
        code === 'ACCOUNT_ALREADY_DELETED' || status === 409;

      if (!isAlreadyDeletedState) {
        throw error;
      }
    }

    setBlockedAccount({
      code: 'ACCOUNT_DELETED',
      type: 'deleted',
      source: 'delete',
      email: firebaseAuth.currentUser?.email ?? null,
      sessionToken: token,
      message: 'Your account has been deleted.',
    });
  },

  async reactivateAccount(email: string): Promise<RecoverAccountResponse> {
    const blockedAccount = getBlockedAccount();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('Unable to determine which account to reactivate.');
    }

    return reactivateAccountRequest(
      normalizedEmail,
      blockedAccount?.sessionToken ?? null,
    );
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
