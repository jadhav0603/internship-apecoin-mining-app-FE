import API from './api';

export type BackendUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan?: string;
  lastLogin?: string;
  createdAt?: string;
};

export type ProfileIdentity = {
  username: string;
  email: string;
  photoURL?: string;
};

export const userService = {
  getMe: async (): Promise<BackendUser> => {
    const res = await API.get<BackendUser>('/user/me');
    return res.data;
  },
  getProfileIdentity: async (): Promise<ProfileIdentity> => {
    const res = await API.get('/user/me');
    const data = res.data;

    return {
      username:
        typeof data?.username === 'string'
          ? data.username
          : typeof data?.displayName === 'string'
            ? data.displayName
            : '',
      email: typeof data?.email === 'string' ? data.email : '',
      photoURL:
        typeof data?.photoURL === 'string'
          ? data.photoURL
          : typeof data?.photoUrl === 'string'
            ? data.photoUrl
            : '',
    };
  },
};