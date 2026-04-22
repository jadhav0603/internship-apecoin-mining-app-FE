import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WalletType = {
  balance: number;
  addToWallet: (amount: number) => void;
};

const WalletContext = createContext<WalletType>({} as WalletType);

export const WalletProvider = ({ children }: any) => {
  const [balance, setBalance] = useState(0);

  const addToWallet = async (amount: number) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    await AsyncStorage.setItem('WALLET', JSON.stringify(newBalance));
  };

  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem('WALLET');
      if (saved) setBalance(JSON.parse(saved));
    };
    load();
  }, []);

  return (
    <WalletContext.Provider value={{ balance, addToWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);