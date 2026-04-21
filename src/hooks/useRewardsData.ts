import { useCallback, useEffect, useRef, useState } from 'react';
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
  // Counter incremented by refresh() to trigger the effect
  const refreshCount = useRef(0);
  const [refreshTick, setRefreshTick] = useState(0);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

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
  }, []);

  // Re-fetch whenever the screen comes into focus OR when refresh() is called
  useFocusEffect(
    useCallback(() => {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, refreshTick])
  );

  const refresh = useCallback(() => {
    refreshCount.current += 1;
    setRefreshTick(refreshCount.current);
  }, []);

  return {
    ...state,
    refresh,
  };
};
