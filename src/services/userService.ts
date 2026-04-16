import API from './api';

export const userService = {
  getMe: async () => {
    const res = await API.get('/user/me');
    return res.data;
  },
};