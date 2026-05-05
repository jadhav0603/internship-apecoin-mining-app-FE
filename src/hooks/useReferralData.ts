import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { authService } from '../services/authService';
import {
  referralService,
  type ReferralHistoryItem,
  type ReferralWeekDatum,
} from '../services/referralService';

type ReferralDataState = {
  referredBy: string | null;
  referralEarnings: number;
  referralCount: number;
  referralHistory: ReferralHistoryItem[];
  weekData: ReferralWeekDatum[];
  referralPercentage: number;
  currency: string;
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: ReferralDataState = {
  referredBy: null,
  referralEarnings: 0,
  referralCount: 0,
  referralHistory: [],
  weekData: [],
  referralPercentage: 0,
  currency: 'APE',
  loading: true,
  error: null,
};

export const useReferralData = () => {
  const [state, setState] = useState<ReferralDataState>(INITIAL_STATE);
  const requestRef = useRef<Promise<void> | null>(null);

  const fetchData = useCallback(async (showLoader: boolean = true) => {
    if (requestRef.current) {
      return requestRef.current;
    }

    if (showLoader) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    const request = (async () => {
      try {
        const user = await authService.waitForAuthRestore();
        if (!user?.email) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const data = await referralService.getStats(user.email);

        setState({
          referredBy: data.referredBy ?? null,
          referralEarnings: data.referralEarnings ?? 0,
          referralCount: data.referralCount ?? 0,
          referralHistory: data.referralHistory ?? [],
          weekData: data.weekData ?? [],
          referralPercentage: data.referralPercentage ?? 0,
          currency: data.currency ?? 'APE',
          loading: false,
          error: null,
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          (err?.message === 'Network Error'
            ? 'Unable to reach the server. Check your connection.'
            : 'Failed to load referral data.');

        if (__DEV__) {
          console.warn('[useReferralData] fetch failed:', message, err?.config?.url);
        }

        setState(prev => ({ ...prev, loading: false, error: message }));
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async (showLoader: boolean) => {
        await fetchData(showLoader);
      };

      load(true);

      const intervalId = setInterval(() => {
        if (isActive) {
          load(false);
        }
      }, 2000);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [fetchData])
  );

  return {
    ...state,
    refresh: fetchData,
  };
};
