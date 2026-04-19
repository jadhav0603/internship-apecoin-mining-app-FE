import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io as socketIO, Socket } from 'socket.io-client';
import auth from '@react-native-firebase/auth';
import API from '../services/api';
import { API_CONFIG } from '../api/config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MiningData {
  email: string;
  multiplier: number;
  status: 'mining' | 'idle' | 'claimed';
  miningStartTime: string | null;
  selectedHour: number;
  selectedMiningPower: string;
  isActive: boolean;
  speed: string;
  baseDollarValue: number;
  dollarToBonkRate: number;
  totalEarned: number;
  currentMiningPoints: number;
  isPaidPlan: boolean;
  adsWatchedCount: number;
  [key: string]: any;
}

type MiningContextType = {
  isMining: boolean;
  secondsLeft: number;
  hours: number;
  multiplier: number;
  earned: number;
  miningData: MiningData | null;
  startMining: (h: number) => Promise<void>;
  stopMining: () => void;
  setMultiplier: (m: number) => Promise<void>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getSocketUrl = () => API_CONFIG.BASE_URL.replace(/\/api$/, '');

/**
 * Given miningStartTime + selectedHour from MongoDB, calculate:
 * - how many seconds are remaining
 * - how many coins were already earned
 *
 * Example:
 *   miningStartTime=5am, selectedHour=2, now=6am
 *   → elapsed=3600s, total=7200s, remaining=3600s  (shows 1 hour left) ✅
 *
 *   miningStartTime=4am, selectedHour=2, now=6am
 *   → elapsed=7200s, remaining=0  (mining complete) ✅
 */
const deriveStateFromDB = (data: MiningData) => {
  if (data.status !== 'mining' || !data.miningStartTime) {
    return { remaining: 0, earnedCoins: 0, isComplete: true };
  }

  const totalSeconds = (data.selectedHour ?? 1) * 3600;
  const elapsed = Math.floor(
    (Date.now() - new Date(data.miningStartTime).getTime()) / 1000
  );
  const remaining = totalSeconds - elapsed;

  const RATE_VALUE = (data.baseDollarValue ?? 0.002) / (data.dollarToBonkRate ?? 0.00000604);
  const bonkPerSecond = (RATE_VALUE * (data.multiplier ?? 1)) / 3600;
  const earnedCoins = Math.min(elapsed, totalSeconds) * bonkPerSecond;

  return {
    remaining: Math.max(0, remaining),
    earnedCoins,
    isComplete: remaining <= 0,
  };
};

// ─── Context ──────────────────────────────────────────────────────────────────

const MiningContext = createContext<MiningContextType>({} as MiningContextType);

export const MiningProvider = ({ children }: any) => {
  const [isMining, setIsMining]          = useState(false);
  const [secondsLeft, setSecondsLeft]    = useState(0);
  const [hours, setHours]                = useState(1);
  const [multiplier, setMultiplierState] = useState(1);
  const [earned, setEarned]              = useState(0);
  const [miningData, setMiningData]      = useState<MiningData | null>(null);

  const socketRef     = useRef<Socket | null>(null);
  const multiplierRef = useRef(multiplier);
  const miningDataRef = useRef(miningData);

  useEffect(() => { multiplierRef.current = multiplier; }, [multiplier]);
  useEffect(() => { miningDataRef.current = miningData; }, [miningData]);

  // ─── Apply DB data to all local state ─────────────────────────────────────
  // Single function used by: socket updates, app-open fetch, startMining response
  const applyMiningData = (data: MiningData) => {
    setMiningData(data);
    setMultiplierState(data.multiplier ?? 1);
    setHours(data.selectedHour ?? 1);

    const { remaining, earnedCoins, isComplete } = deriveStateFromDB(data);

    if (!isComplete) {
      setIsMining(true);
      setSecondsLeft(remaining);  // ← always recalculated from miningStartTime
      setEarned(earnedCoins);
    } else {
      setIsMining(false);
      setSecondsLeft(0);
      setEarned(earnedCoins);
    }
  };

  // ─── Socket.IO — connects once Firebase confirms the user is logged in ─────
  // Using onAuthStateChanged fixes the "need to reload" problem:
  // auth().currentUser is null on first render — onAuthStateChanged waits for it
  useEffect(() => {
    let socket: Socket | null = null;

    const unsubscribeAuth = auth().onAuthStateChanged(firebaseUser => {
      // Clean up any existing socket when auth state changes
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      if (!firebaseUser?.email) return;

      const email = firebaseUser.email;

      socket = socketIO(getSocketUrl(), {
        transports: ['websocket'],
        reconnectionAttempts: 10,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[socket.io] connected → joining room for', email);
        socket!.emit('join_mining_room', email);
      });

      // 🔴 Fires instantly when you change anything in MongoDB Compass/Atlas
      // No app reload needed — this pushes the update directly to the frontend
      socket.on('mining_update', (data: MiningData) => {
        console.log('[socket.io] mining_update received, miningStartTime:', data.miningStartTime);
        applyMiningData(data);
      });

      socket.on('disconnect', () => console.log('[socket.io] disconnected'));
    });

    return () => {
      unsubscribeAuth();    // stop listening to Firebase auth
      socket?.disconnect(); // close socket on unmount
    };
  }, []);

  // ─── App open: fetch latest mining state from backend ─────────────────────
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await API.get('/mining/status');
        if (response.data?.mining) {
          console.log('[mining] restored from backend:', response.data.mining.miningStartTime);
          applyMiningData(response.data.mining);
          await AsyncStorage.setItem('MINING_DATA', JSON.stringify({
            startTime: new Date(response.data.mining.miningStartTime).getTime(),
            duration: (response.data.mining.selectedHour ?? 1) * 3600,
            multiplier: response.data.mining.multiplier ?? 1,
            earned: 0,
          }));
        }
      } catch {
        // Backend unreachable — fall back to AsyncStorage
        const saved = await AsyncStorage.getItem('MINING_DATA');
        if (!saved) return;
        const data = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
        const remaining = data.duration - elapsed;
        if (remaining > 0) {
          setIsMining(true);
          setSecondsLeft(remaining);
          setMultiplierState(data.multiplier ?? 1);
        }
      }
    };

    fetchStatus();
  }, []);

  // ─── Start Mining ─────────────────────────────────────────────────────────
  const startMining = async (h: number) => {
    const totalSeconds = h * 3600;
    setIsMining(true);
    setHours(h);
    setSecondsLeft(totalSeconds);
    setEarned(0);

    await AsyncStorage.setItem('MINING_DATA', JSON.stringify({
      startTime: Date.now(),
      duration: totalSeconds,
      multiplier: 1,
      earned: 0,
    }));

    try {
      const response = await API.post('/mining/start', {
        selectedHour: h,
        selectedMiningPower: '0 - 0',
        speed: '1 KH/s',
      });
      console.log('[mining] saved to backend:', response.data?.mining?._id);
      if (response.data?.mining) {
        applyMiningData(response.data.mining);
      }
    } catch (err) {
      console.error('[mining] failed to save to backend:', err);
    }
  };

  // ─── Stop Mining ──────────────────────────────────────────────────────────
  const stopMining = async () => {
    setIsMining(false);
    setSecondsLeft(0);
    await AsyncStorage.removeItem('MINING_DATA');
  };

  const setMultiplier = async (m: number) => {
    if (!isMining) return;              // only track during active session
    setMultiplierState(m);              // update UI immediately

    try {
      const response = await API.post('/mining/multiplier', { multiplier: m });
      if (response.data?.mining) {
        setMiningData(response.data.mining);  // sync full doc (with new history)
      }
      console.log('[mining] multiplier updated to', m);
    } catch (err) {
      console.error('[mining] failed to update multiplier:', err);
    }
  };

  // ─── Timer engine ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMining) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { stopMining(); return 0; }
        return prev - 1;
      });

      const d    = miningDataRef.current;
      const base = d?.baseDollarValue ?? 0.002;
      const rate = d?.dollarToBonkRate ?? 0.00000604;
      const m    = multiplierRef.current;
      setEarned(prev => prev + ((base / rate) * m / 3600));
    }, 1000);

    return () => clearInterval(interval);
  }, [isMining]);

  // ─── Provider ─────────────────────────────────────────────────────────────
  return (
    <MiningContext.Provider value={{
      isMining, secondsLeft, hours, multiplier, earned, miningData,
      startMining, stopMining, setMultiplier,
    }}>
      {children}
    </MiningContext.Provider>
  );
};

export const useMining = () => {
  const ctx = useContext(MiningContext);
  if (!ctx) throw new Error('useMining must be used inside MiningProvider');
  return ctx;
};