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

export const userService = {
  getMe: async (): Promise<BackendUser> => {
    const res = await API.get<BackendUser>('/user/me');
    return res.data;
  },
};
