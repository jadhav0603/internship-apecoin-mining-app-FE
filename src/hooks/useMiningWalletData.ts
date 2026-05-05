import { useCallback, useRef, useState } from 'react';
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
  const requestRef = useRef<Promise<void> | null>(null);

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

  const loadMiningData = useCallback(async (showLoader: boolean = true) => {
    if (requestRef.current) {
      return requestRef.current;
    }

    if (showLoader) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    const request = (async () => {
      try {
        const { miningTotal, miningHistory, currency } = await fetchMiningData();

        setState({
          miningTotal,
          miningHistory,
          currency,
          loading: false,
          error: null,
        });
      } catch (err: any) {
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
    })();

    requestRef.current = request;

    try {
      await request;
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
      }
    }
  }, [fetchMiningData]);

  useFocusEffect(
    useCallback(() => {
      loadMiningData(true).catch(() => undefined);

      const intervalId = setInterval(() => {
        loadMiningData(false).catch(() => undefined);
      }, 2000);

      return () => {
        clearInterval(intervalId);
      };
    }, [loadMiningData])
  );

  return {
    ...state,
    refresh: loadMiningData,
  };
};
