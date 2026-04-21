import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { authService } from '../services/authService';

export type MiningHistoryDatum = {
  date: string;
  dayLabel: string;
  totalAmount: number;
};

type MiningWalletResponse = {
  miningTotal: number;
  miningHistory: MiningHistoryDatum[];
  currency?: string;
};

type MiningWalletState = {
  miningTotal: number;
  miningHistory: MiningHistoryDatum[];
  currency: string;
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: MiningWalletState = {
  miningTotal: 0,
  miningHistory: [],
  currency: 'APE',
  loading: true,
  error: null,
};

export const useMiningWalletData = () => {
  const [state, setState] = useState<MiningWalletState>(INITIAL_STATE);

  const fetchMiningData = useCallback(async () => {
    const user = await authService.waitForAuthRestore();

    if (!user) {
      return {
        miningTotal: 0,
        miningHistory: [],
        currency: 'APE',
      };
    }

    const response = await apiClient.get<MiningWalletResponse>('mining/wallet-summary');

    return {
      miningTotal: response.data?.miningTotal ?? 0,
      miningHistory: response.data?.miningHistory ?? [],
      currency: response.data?.currency ?? 'APE',
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadMiningData = async (showLoader: boolean) => {
        if (showLoader) {
          setState(prev => ({ ...prev, loading: true, error: null }));
        }

        try {
          const { miningTotal, miningHistory, currency } = await fetchMiningData();

          if (!isActive) {
            return;
          }

          setState({
            miningTotal,
            miningHistory,
            currency,
            loading: false,
            error: null,
          });
        } catch (err: any) {
          if (!isActive) {
            return;
          }

          const message =
            err?.response?.data?.message ||
            (err?.message === 'Network Error'
              ? 'Unable to reach the server. Check your connection.'
              : 'Failed to load mining wallet data.');

          if (__DEV__) {
            console.warn('[useMiningWalletData] fetch failed:', message, err?.config?.url);
          }

          setState(prev => ({
            ...prev,
            loading: false,
            error: message,
          }));
        }
      };

      loadMiningData(true).catch(() => undefined);

      const intervalId = setInterval(() => {
        loadMiningData(false).catch(() => undefined);
      }, 600000);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [fetchMiningData])
  );

  return state;
};
