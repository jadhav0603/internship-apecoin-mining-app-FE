import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { authService } from '../services/authService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeekDayDatum = {
  /** Short day label: 'Mon', 'Tue', … */
  dayLabel: string;
  /** UTC date string YYYY-MM-DD */
  date: string;
  /** Sum of rewards claimed on this UTC day (APE coins) */
  totalAmount: number;
};

type RewardsHistoryResponse = {
  totalCollected: number;
  weekData: { date: string; dayLabel: string; totalAmount: number }[];
  currency: string;
};

type RewardsDataState = {
  totalCollected: number;
  weekData: WeekDayDatum[];
  currency: string;
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: RewardsDataState = {
  totalCollected: 0,
  weekData: [],
  currency: 'APE',
  loading: true,
  error: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the user's daily-rewards history from `/api/rewards/history/:email`.
 * - Automatically re-fetches when the screen gains focus (via `useFocusEffect`).
 * - Exposes a `refresh()` method so callers can trigger a re-fetch after a claim.
 */
export const useRewardsData = () => {
  const [state, setState] = useState<RewardsDataState>(INITIAL_STATE);
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

        const response = await apiClient.get<RewardsHistoryResponse>(
          `rewards/history/${encodeURIComponent(user.email)}`
        );

        const { totalCollected, weekData, currency } = response.data;

        setState({
          totalCollected,
          weekData,
          currency: currency ?? 'APE',
          loading: false,
          error: null,
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          (err?.message === 'Network Error'
            ? 'Unable to reach the server. Check your connection.'
            : 'Failed to load rewards data.');

        if (__DEV__) {
          console.warn('[useRewardsData] fetch failed:', message, err?.config?.url);
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

  // Re-fetch whenever the screen comes into focus OR when refresh() is called
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
