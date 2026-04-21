import { useCallback, useEffect, useRef, useState } from 'react';
import { io as SocketIO, Socket } from 'socket.io-client';
import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';

export type LeaderboardEntry = {
  rank: number;
  userId?: string;
  email: string;
  name: string;
  imageUrl: string | null;
  score: number;
  totalEarned: number;
  referralEarnings: number;
  referralCount: number;
};

type UseLeaderboardResult = {
  data: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  currentUserRank: number | null;
  refresh: () => void;
};

const LEADERBOARD_ENDPOINT = '/leaderboard';

export const useLeaderboard = (currentUserEmail?: string): UseLeaderboardResult => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isMountedRef = useRef(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ leaderboard: LeaderboardEntry[] }>(
        LEADERBOARD_ENDPOINT
      );
      if (isMountedRef.current) {
        setData(response.data.leaderboard ?? []);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(
          err?.response?.data?.message ?? 'Failed to load leaderboard.'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Socket.IO for live updates
  useEffect(() => {
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const socket = SocketIO(baseUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_leaderboard');
    });

    socket.on('leaderboard_update', (snapshot: LeaderboardEntry[]) => {
      if (isMountedRef.current && Array.isArray(snapshot)) {
        // Merge: if snapshot is top-20, keep the rest of the full list unchanged
        setData(prev => {
          const updatedMap = new Map(snapshot.map(e => [e.email, e]));
          const fullList = prev.map(e => updatedMap.get(e.email) ?? e);

          // Add any totally new entries not previously in the list
          snapshot.forEach(e => {
            if (!fullList.find(p => p.email === e.email)) {
              fullList.push(e);
            }
          });

          // Re-rank
          fullList.sort((a, b) => b.score - a.score);
          return fullList.map((e, i) => ({ ...e, rank: i + 1 }));
        });
      }
    });

    socket.on('connect_error', (err) => {
      if (__DEV__) {
        console.warn('[useLeaderboard] socket connect error:', err.message);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const currentUserRank =
    currentUserEmail
      ? (data.find(e => e.email === currentUserEmail)?.rank ?? null)
      : null;

  return { data, loading, error, currentUserRank, refresh: fetchLeaderboard };
};
