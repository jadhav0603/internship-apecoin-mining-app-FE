import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import API from '../services/api';

type WalletType = {
  balance: number;
  refreshBalance: () => Promise<void>;
  setBalanceFromServer: (amount: number) => void;
};

const WalletContext = createContext<WalletType>({} as WalletType);

export const WalletProvider = ({ children }: any) => {
  const [balance, setBalance] = useState(0);

  const refreshBalance = async () => {
    try {
      const response = await API.get('/user/me');
      setBalance(response.data?.usdBalance ?? 0);
    } catch (error) {
      console.error('[wallet] failed to load balance:', error);
      setBalance(0);
    }
  };

  const setBalanceFromServer = (amount: number) => {
    setBalance(amount ?? 0);
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setBalance(0);
        void refreshBalance();
      } else {
        setBalance(0);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <WalletContext.Provider value={{ balance, refreshBalance, setBalanceFromServer }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
