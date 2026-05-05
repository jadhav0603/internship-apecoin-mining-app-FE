import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import auth from '@react-native-firebase/auth';
import API from '../services/api';

type WalletBreakdown = {
  totalBalance: number;
  miningAmount: number;
  rewardAmount: number;
  referralAmount: number;
};

type WalletType = {
  balance: number;
  loading: boolean;
  breakdown: WalletBreakdown;
  refreshBalance: () => Promise<void>;
  setBalanceFromServer: (amount: number) => void;
};

const WalletContext = createContext<WalletType>({} as WalletType);

const ZERO_BREAKDOWN: WalletBreakdown = {
  totalBalance: 0,
  miningAmount: 0,
  rewardAmount: 0,
  referralAmount: 0,
};

const getFiniteAmount = (...values: Array<number | undefined>) => {
  const nextValue = values.find(value => Number.isFinite(value));
  return typeof nextValue === 'number' ? nextValue : 0;
};

const normalizeBreakdown = (data: any): WalletBreakdown => {
  const totalBalance = getFiniteAmount(
    data?.totalBalance,
    data?.walletBalance,
    data?.usdBalance,
  );

  if (totalBalance <= 0) {
    return ZERO_BREAKDOWN;
  }

  return {
    totalBalance,
    miningAmount: getFiniteAmount(data?.miningAmount, data?.miningBalance),
    rewardAmount: getFiniteAmount(data?.rewardAmount, data?.rewardsBalance),
    referralAmount: getFiniteAmount(
      data?.referralAmount,
      data?.referralBalance,
    ),
  };
};

export const WalletProvider = ({ children }: any) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState<WalletBreakdown>(ZERO_BREAKDOWN);
  const balanceRequestRef = useRef<Promise<void> | null>(null);

  const refreshBalance = useCallback(async () => {
    if (balanceRequestRef.current) {
      return balanceRequestRef.current;
    }

    setLoading(true);

    const request = (async () => {
      try {
        const response = await API.get('/user/me');
        const nextBreakdown = normalizeBreakdown(response.data);

        setBreakdown(nextBreakdown);
        setBalance(nextBreakdown.totalBalance);
      } catch (error) {
        console.error('[wallet] failed to load balance:', error);
      } finally {
        setLoading(false);
      }
    })();

    balanceRequestRef.current = request;

    try {
      await request;
    } finally {
      if (balanceRequestRef.current === request) {
        balanceRequestRef.current = null;
      }
    }
  }, []);

  const setBalanceFromServer = useCallback((amount: number) => {
    setBalance(Number.isFinite(amount) ? amount : 0);
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        void refreshBalance();
      } else {
        setBalance(0);
        setBreakdown(ZERO_BREAKDOWN);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [refreshBalance]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        loading,
        breakdown,
        refreshBalance,
        setBalanceFromServer,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
