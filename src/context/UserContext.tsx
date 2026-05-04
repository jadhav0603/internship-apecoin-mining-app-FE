import React, { createContext, useContext, useMemo, useState } from 'react';

export type AppUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan?: string;
  referredBy?: string | null;
  referralEarnings?: number;
  referralCount?: number;
  termsAccepted?: boolean;
  termsAcceptedAt?: string | null;
  termsVersion?: string | null;
  currentTermsVersion?: string;
  acceptedTerms?: boolean;
};

type UserContextValue = {
  user: AppUser | null;
  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const getUserDisplayName = (user: AppUser | null | undefined) => {
  const displayName = user?.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const emailLocalPart = user?.email?.split('@')[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart;
  }

  return 'User';
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
