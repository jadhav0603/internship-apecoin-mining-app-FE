import API from './api';

export type BackendUser = {
  uid: string;
  email: string;
  displayName?: string;
  name?: string;
  photoURL?: string;
  imageUrl?: string;
  plan?: string;
  accountType?: string;
  status?: string;
  wallet?: string;
  walletBalance?: number;
  totalBalance?: number;
  miningAmount?: number;
  rewardAmount?: number;
  referralAmount?: number;
  totalEarnedBalance?: number;
  withdrawnBalance?: number;
  referredBy?: string | null;
  referralEarnings?: number;
  referralCount?: number;
  termsAccepted?: boolean;
  termsAcceptedAt?: string | null;
  termsVersion?: string | null;
  currentTermsVersion?: string;
  acceptedTerms?: boolean;
  lastLogin?: string;
  createdAt?: string;
};

export type ProfileIdentity = {
  username: string;
  email: string;
  photoURL?: string;
};

export type UploadProfileImageResponse = {
  success: boolean;
  imageUrl: string;
  user: BackendUser;
};

export type AcceptTermsResponse = BackendUser & {
  success: boolean;
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
        typeof data?.name === 'string' && data.name
          ? data.name
          : typeof data?.displayName === 'string' && data.displayName
          ? data.displayName
          : typeof data?.username === 'string'
          ? data.username
          : '',
      email: typeof data?.email === 'string' ? data.email : '',
      photoURL:
        typeof data?.imageUrl === 'string' && data.imageUrl
          ? data.imageUrl
          : typeof data?.photoURL === 'string'
          ? data.photoURL
          : typeof data?.photoUrl === 'string'
          ? data.photoUrl
          : '',
    };
  },

  /**
   * Uploads a profile image to Cloudinary via the backend.
   * @param imageUri  Local file URI from the image picker
   * @param mimeType  MIME type (e.g. 'image/jpeg')
   * @param fileName  Original file name
   */
  uploadProfileImage: async (
    imageUri: string,
    mimeType = 'image/jpeg',
    fileName = 'avatar.jpg',
  ): Promise<UploadProfileImageResponse> => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: mimeType,
      name: fileName,
    } as any);

    const res = await API.put<UploadProfileImageResponse>(
      '/users/update-profile-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return res.data;
  },

  updateProfile: async (name: string): Promise<BackendUser> => {
    const res = await API.put<BackendUser>('/user/update-profile', { name });
    return res.data;
  },

  acceptTerms: async (): Promise<AcceptTermsResponse> => {
    const res = await API.patch<AcceptTermsResponse>('/user/accept-terms');
    return res.data;
  },

  registerPushToken: async (token: string) => {
    const res = await API.put('/user/push-token', { token });
    return res.data;
  },

  unregisterPushToken: async (token: string) => {
    const res = await API.delete('/user/push-token', {
      data: { token },
    });
    return res.data;
  },
};
