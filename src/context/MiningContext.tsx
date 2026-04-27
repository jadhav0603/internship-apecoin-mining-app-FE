import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io as socketIO, Socket } from 'socket.io-client';
import auth from '@react-native-firebase/auth';
import API from '../services/api';
import { API_CONFIG } from '../api/config';

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
  apeDollarValue?: number;
  remainingSeconds?: number;
  sessionEndTime?: string | null;
  canClaim?: boolean;
  shouldShowClaimPopup?: boolean;
  [key: string]: any;
}

type MiningContextType = {
  isMining: boolean;
  secondsLeft: number;
  hours: number;
  multiplier: number;
  earned: number;
  claimRewardAmount: number;
  miningData: MiningData | null;
  multipliers: number[];
  showClaimPopup: boolean;
  hasUnclaimedReward: boolean;
  startMining: (h: number) => Promise<void>;
  stopMining: () => Promise<void>;
  setMultiplier: (m: number) => Promise<void>;
  dismissClaimPopup: () => void;
  openClaimPopup: () => void;
};

const MINING_STORAGE_KEY = 'MINING_DATA';
const getSocketUrl = () => API_CONFIG.BASE_URL.replace(/\/api$/, '');

const getElapsedSeconds = (data: MiningData, now = Date.now()) => {
  if (!data.miningStartTime) {
    return 0;
  }

  const startTime = new Date(data.miningStartTime).getTime();

  if (Number.isNaN(startTime)) {
    return 0;
  }

  const rawElapsed = Math.floor((now - startTime) / 1000);
  const totalSeconds = (data.selectedHour ?? 1) * 3600;

  return Math.max(0, Math.min(rawElapsed, totalSeconds));
};

const getLiveEarnedCoins = (data: MiningData, now = Date.now()) => {
  if (data.status !== 'mining' || !data.miningStartTime || !data.isActive) {
    return data.currentMiningPoints ?? 0;
  }

  const base = data.baseDollarValue ?? 0.002;
  const apeValue = data.apeDollarValue && data.apeDollarValue > 0 ? data.apeDollarValue : 0.1;
  const activeMultiplier = data.multiplier ?? 1;
  const apePerHour = (base / apeValue) * activeMultiplier;
  const apePerSecond = apePerHour / 3600;

  return getElapsedSeconds(data, now) * apePerSecond;
};

const getDisplayEarnedCoins = (data: MiningData) => {
  const canClaimReward = Boolean(data.canClaim) && data.status !== 'claimed';

  if (data.miningStartTime && (data.status === 'mining' || canClaimReward)) {
    return getLiveEarnedCoins(data);
  }

  if (canClaimReward) {
    return data.currentMiningPoints ?? 0;
  }

  return 0;
};

const deriveStateFromDB = (data: MiningData) => {
  if (typeof data.remainingSeconds === 'number') {
    return {
      remaining: Math.max(0, data.remainingSeconds),
      earnedCoins: getDisplayEarnedCoins(data),
      isComplete:
        data.remainingSeconds <= 0 ||
        data.status !== 'mining' ||
        !data.isActive,
    };
  }

  if (data.status !== 'mining' || !data.miningStartTime) {
    return {
      remaining: 0,
      earnedCoins: getDisplayEarnedCoins(data),
      isComplete: true,
    };
  }

  const totalSeconds = (data.selectedHour ?? 1) * 3600;
  const remaining = Math.max(0, totalSeconds - getElapsedSeconds(data));

  return {
    remaining,
    earnedCoins: getDisplayEarnedCoins(data),
    isComplete: remaining <= 0,
  };
};

const MiningContext = createContext<MiningContextType>({} as MiningContextType);

export const MiningProvider = ({ children }: any) => {
  const [isMining, setIsMining] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [hours, setHours] = useState(1);
  const [multiplier, setMultiplierState] = useState(1);
  const [earned, setEarned] = useState(0);
  const [claimRewardAmount, setClaimRewardAmount] = useState(0);
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [multipliers, setMultipliers] = useState<number[]>([
    1, 2, 4, 8, 10, 15, 20, 25,
  ]);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [hasUnclaimedReward, setHasUnclaimedReward] = useState(false);
  const [pendingClaimCoins, setPendingClaimCoins] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const multiplierRef = useRef(multiplier);
  const miningDataRef = useRef(miningData);
  const lastAutoShownClaimKeyRef = useRef<string | null>(null);
  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);

  useEffect(() => {
    miningDataRef.current = miningData;
  }, [miningData]);

  const resetMiningState = () => {
    setIsMining(false);
    setSecondsLeft(0);
    setHours(1);
    setMultiplierState(1);
    setEarned(0);
    setClaimRewardAmount(0);
    setMiningData(null);
    setShowClaimPopup(false);
    setHasUnclaimedReward(false);
    setPendingClaimCoins(null);
    lastAutoShownClaimKeyRef.current = null;
  };

  const applyMiningData = (data: MiningData, stats?: any) => {
    const updatedData = {
      ...data,
      ...(stats || {}),
      apeDollarValue: stats?.apeDollarValue ?? data.apeDollarValue ?? 0.1,
    };

    if (stats?.miningMultipliers) {
      setMultipliers(stats.miningMultipliers);
    }

    setMiningData(updatedData);
    setMultiplierState(updatedData.multiplier ?? 1);
    setHours(updatedData.selectedHour ?? 1);

    const { remaining, earnedCoins, isComplete } = deriveStateFromDB(updatedData);
    const claimKey =
      updatedData.sessionEndTime ??
      updatedData.miningStartTime ??
      `${updatedData.email}-${updatedData.selectedHour}`;
    const canClaimReward =
      isComplete &&
      Boolean(updatedData.miningStartTime) &&
      updatedData.status !== 'claimed';

    if (!isComplete) {
      setIsMining(true);
      setSecondsLeft(remaining);
      setEarned(earnedCoins);
      setClaimRewardAmount(0);
      setHasUnclaimedReward(false);
      setShowClaimPopup(false);
      setPendingClaimCoins(null);
      lastAutoShownClaimKeyRef.current = null;
    } else {
      setIsMining(false);
      setSecondsLeft(0);
      setEarned(earnedCoins);
      setClaimRewardAmount(canClaimReward ? earnedCoins : 0);
      setHasUnclaimedReward(canClaimReward);

      if (canClaimReward && lastAutoShownClaimKeyRef.current !== claimKey) {
        setShowClaimPopup(false);
        setPendingClaimCoins(earnedCoins);
        lastAutoShownClaimKeyRef.current = claimKey;
      } else if (!canClaimReward) {
        setShowClaimPopup(false);
        setPendingClaimCoins(null);
        lastAutoShownClaimKeyRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (pendingClaimCoins === null || !hasUnclaimedReward) {
      return;
    }

    if (Math.abs(earned - pendingClaimCoins) > 0.0000001) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowClaimPopup(true);
      setPendingClaimCoins(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pendingClaimCoins, hasUnclaimedReward, earned]);

  useEffect(() => {
    let socket: Socket | null = null;

    const unsubscribeAuth = auth().onAuthStateChanged(firebaseUser => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      if (!firebaseUser?.email) {
        return;
      }

      const email = firebaseUser.email;

      socket = socketIO(getSocketUrl(), {
        transports: ['websocket'],
        reconnectionAttempts: 10,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[socket.io] connected, joining room for', email);
        socket!.emit('join_mining_room', email);
      });

      socket.on('mining_update', (data: MiningData) => {
        console.log(
          '[socket.io] mining_update received, miningStartTime:',
          data.miningStartTime,
        );
        applyMiningData(data);
      });

      socket.on('disconnect', () => console.log('[socket.io] disconnected'));
    });

    return () => {
      unsubscribeAuth();
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await API.get('/mining/status');
        if (response.data?.mining) {
          const restoredMining = {
            ...response.data.mining,
            ...(response.data.stats ?? {}),
          };
          console.log(
            '[mining] restored from backend:',
            restoredMining.miningStartTime,
          );
          applyMiningData(restoredMining, response.data.stats);

          const { isComplete } = deriveStateFromDB(restoredMining);
          if (isComplete) {
            await AsyncStorage.removeItem(MINING_STORAGE_KEY);
          } else {
            await AsyncStorage.setItem(
              MINING_STORAGE_KEY,
              JSON.stringify({
                startTime: new Date(restoredMining.miningStartTime).getTime(),
                duration: (restoredMining.selectedHour ?? 1) * 3600,
                multiplier: restoredMining.multiplier ?? 1,
                earned: 0,
              }),
            );
          }
        } else {
          resetMiningState();
          await AsyncStorage.removeItem(MINING_STORAGE_KEY);
        }
      } catch {
        const saved = await AsyncStorage.getItem(MINING_STORAGE_KEY);
        if (!saved) {
          resetMiningState();
          return;
        }

        const data = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
        const remaining = data.duration - elapsed;

        if (remaining > 0) {
          setIsMining(true);
          setSecondsLeft(remaining);
          setMultiplierState(data.multiplier ?? 1);
        } else {
          await AsyncStorage.removeItem(MINING_STORAGE_KEY);
        }
      }
    };

    fetchStatus();
  }, []);

  const startMining = async (h: number) => {
    if (hasUnclaimedReward) {
      setShowClaimPopup(true);
      return;
    }

    const totalSeconds = h * 3600;
    setIsMining(true);
    setHours(h);
    setSecondsLeft(totalSeconds);
    setEarned(0);
    setShowClaimPopup(false);

    await AsyncStorage.setItem(
      MINING_STORAGE_KEY,
      JSON.stringify({
        startTime: Date.now(),
        duration: totalSeconds,
        multiplier: 1,
        earned: 0,
      }),
    );

    try {
      const response = await API.post('/mining/start', {
        selectedHour: h,
        selectedMiningPower: '0 - 0',
        speed: '1 KH/s',
      });
      console.log('[mining] saved to backend:', response.data?.mining?._id);
      if (response.data?.mining) {
        applyMiningData(
          {
            ...response.data.mining,
            ...(response.data.stats ?? {}),
          },
          response.data.stats,
        );
      }
    } catch (err) {
      console.error('[mining] failed to save to backend:', err);
    }
  };

  // ✅ 2-SECOND POLLING
  useEffect(() => {
    if (!isMining) return;

    const poll = setInterval(async () => {
      try {
        const response = await API.get('/mining/status');
        if (response.data?.mining) {
          applyMiningData(
            {
              ...response.data.mining,
              ...(response.data.stats ?? {}),
            },
            response.data.stats,
          );
        }
      } catch (e: any) {
        if (e?.response?.status === 401) {
          setIsMining(false); // Stop polling if unauthorized (logged out)
        } else if (__DEV__) {
          console.warn('[mining] poll failed', e.message);
        }
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [isMining]);

  const stopMining = async () => {
    setIsMining(false);
    setSecondsLeft(0);
    setEarned(0);
    setClaimRewardAmount(0);
    setMultiplierState(1);
    setHasUnclaimedReward(false);
    setMiningData(prev =>
      prev
        ? {
            ...prev,
            status: 'claimed',
            currentMiningPoints: 0,
            canClaim: false,
            shouldShowClaimPopup: false,
          }
        : prev,
    );
    setShowClaimPopup(false);
    setPendingClaimCoins(null);
    lastAutoShownClaimKeyRef.current = null;
    await AsyncStorage.removeItem(MINING_STORAGE_KEY);
    // ✅ Immediately refresh wallet balance so it doesn't reset to 0 on page load
  };

  const setMultiplier = async (m: number) => {
    if (!isMining) {
      return;
    }

    setMultiplierState(m);

    try {
      const response = await API.post('/mining/multiplier', { multiplier: m });
      if (response.data?.mining) {
        applyMiningData(
          {
            ...response.data.mining,
            ...(response.data.stats ?? {}),
          },
          response.data.apeDollarValue,
        );
      }
      console.log('[mining] multiplier updated to', m);
    } catch (err: any) {
      if (err?.response?.data?.mining) {
        applyMiningData(
          {
            ...err.response.data.mining,
            ...(err.response.data.stats ?? {}),
          },
          err.response.data.apeDollarValue,
        );
      }
      console.error('[mining] failed to update multiplier:', err);
    }
  };

  useEffect(() => {
    if (!isMining) {
      return;
    }

    const interval = setInterval(() => {
      const d = miningDataRef.current;

      if (!d) {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
        return;
      }

      const totalSeconds = (d.selectedHour ?? 1) * 3600;
      const elapsedSeconds = getElapsedSeconds(d);
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);

      setSecondsLeft(remaining);
      setEarned(getLiveEarnedCoins({ ...d, multiplier: multiplierRef.current }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isMining]);

  return (
    <MiningContext.Provider
      value={{
        isMining,
        secondsLeft,
        hours,
        multiplier,
        earned,
        claimRewardAmount,
        miningData,
        multipliers,
        showClaimPopup,
        hasUnclaimedReward,
        startMining,
        stopMining,
        setMultiplier,
        dismissClaimPopup: () => setShowClaimPopup(false),
        openClaimPopup: () => setShowClaimPopup(true),
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};

export const useMining = () => {
  const ctx = useContext(MiningContext);
  if (!ctx) {
    throw new Error('useMining must be used inside MiningProvider');
  }
  return ctx;
};
