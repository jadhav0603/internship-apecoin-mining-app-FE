import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io as socketIO, Socket } from 'socket.io-client';
import auth from '@react-native-firebase/auth';
import API from '../services/api';
import { API_CONFIG } from '../api/config';

export interface MiningData {
  email: string;
  multiplier: number;
  status: 'mining' | 'idle' | 'claimed' | 'withdrawn';
  miningStartTime: string | null;
  miningEndTime?: string | null;
  selectedHour: number;
  selectedMiningPower: unknown;
  isActive: boolean;
  speed: string;
  baseDollarValue: number;
  dollarToBonkRate: number;
  totalEarned: number;
  currentMiningPoints: number;
  isPaidPlan: boolean;
  dollarPlanPerSec?: number;
  adsWatchedCount: number;
  apeDollarValue?: number;
  serverTime?: string;
  serverTimeOffsetMs?: number;
  remainingSeconds?: number;
  sessionEndTime?: string | null;
  canClaim?: boolean;
  shouldShowClaimPopup?: boolean;
  multiplierHistory?: Array<{
    multiplier?: number;
    startTime?: string;
    endTime?: string | null;
  }>;
  currentApeCoins?: number;
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
  setMultiplier: (m: number) => Promise<boolean>;
  refreshMiningStatus: () => Promise<void>;
  dismissClaimPopup: () => void;
  openClaimPopup: () => void;
};

const DEFAULT_BASE_DOLLAR_VALUE = 0.002;
const DEFAULT_DOLLAR_TO_BONK_RATE = 0.1;
const MINING_DECIMAL_PLACES = 6;

const getSocketUrl = () => API_CONFIG.BASE_URL.replace(/\/api$/, '');

const roundCoins = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(MINING_DECIMAL_PLACES)) : 0;

const toTimestamp = (value: string | Date | null | undefined) => {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const isFreePlan = (selectedMiningPower: unknown) => {
  if (
    selectedMiningPower &&
    typeof selectedMiningPower === 'object' &&
    !Array.isArray(selectedMiningPower)
  ) {
    const plan = selectedMiningPower as Record<string, unknown>;
    const monthValue =
      typeof plan.month === 'string' ? plan.month.trim().toLowerCase() : '';
    const priceValue =
      typeof plan.price === 'string' || typeof plan.price === 'number'
        ? String(plan.price).trim()
        : '';

    return monthValue === 'free' || priceValue === '0' || priceValue === '0000';
  }

  const normalizedValue =
    typeof selectedMiningPower === 'string'
      ? selectedMiningPower.replace(/\s+/g, '').toLowerCase()
      : '';

  return (
    normalizedValue === '0-0' ||
    normalizedValue === '1kh/s-free' ||
    normalizedValue.includes('free')
  );
};

const getDollarToBonkRate = (data: MiningData) => {
  if (
    typeof data.dollarToBonkRate === 'number' &&
    Number.isFinite(data.dollarToBonkRate) &&
    data.dollarToBonkRate > 0
  ) {
    return data.dollarToBonkRate;
  }

  if (
    typeof data.apeDollarValue === 'number' &&
    Number.isFinite(data.apeDollarValue) &&
    data.apeDollarValue > 0
  ) {
    return data.apeDollarValue;
  }

  return DEFAULT_DOLLAR_TO_BONK_RATE;
};

const getRatePerSecond = (data: MiningData, multiplierValue: number) => {
  const baseDollarValue =
    typeof data.baseDollarValue === 'number' && Number.isFinite(data.baseDollarValue)
      ? data.baseDollarValue
      : DEFAULT_BASE_DOLLAR_VALUE;
  const dollarToBonkRate = getDollarToBonkRate(data);

  if (dollarToBonkRate <= 0) {
    return 0;
  }

  const rateValue = baseDollarValue / dollarToBonkRate;
  const bonkPerHour = rateValue * multiplierValue;
  const baseRatePerSecond = bonkPerHour / 3600;
  const paidPlanRatePerSecond =
    data.isPaidPlan && !isFreePlan(data.selectedMiningPower)
      ? Math.max(0, Number(data.dollarPlanPerSec) || 0)
      : 0;

  return baseRatePerSecond + paidPlanRatePerSecond;
};

const getServerNow = (data: MiningData, now = Date.now()) =>
  now + (data.serverTimeOffsetMs ?? 0);

const getSessionEndTimestamp = (data: MiningData) => {
  const explicitEndTime = toTimestamp(data.miningEndTime ?? data.sessionEndTime ?? null);
  if (explicitEndTime !== null) {
    return explicitEndTime;
  }

  const startTime = toTimestamp(data.miningStartTime);
  if (startTime === null) {
    return null;
  }

  return startTime + (data.selectedHour ?? 1) * 3600 * 1000;
};

const getElapsedSeconds = (data: MiningData, now = Date.now()) => {
  const startTime = toTimestamp(data.miningStartTime);
  if (startTime === null) {
    return 0;
  }

  const rawElapsed = Math.floor((getServerNow(data, now) - startTime) / 1000);
  const totalSeconds = (data.selectedHour ?? 1) * 3600;
  return Math.max(0, Math.min(rawElapsed, totalSeconds));
};

const isClaimableMiningSession = (data: MiningData) =>
  Boolean(data.miningStartTime) &&
  Boolean(data.canClaim) &&
  data.status !== 'claimed';

const isActiveMiningSession = (data: MiningData) =>
  data.status === 'mining' &&
  Boolean(data.miningStartTime) &&
  Boolean(data.isActive);

const calculateLiveEarnedCoins = (data: MiningData, now = Date.now()) => {
  const startTime = toTimestamp(data.miningStartTime);
  if (startTime === null) {
    return 0;
  }

  const sessionEndTime = getSessionEndTimestamp(data);
  const calcUntil = Math.min(getServerNow(data, now), sessionEndTime ?? Number.MAX_SAFE_INTEGER);

  if (calcUntil <= startTime) {
    return 0;
  }

  const totalSessionSeconds = (calcUntil - startTime) / 1000;
  const multiplierHistory = Array.isArray(data.multiplierHistory)
    ? [...data.multiplierHistory].sort(
        (a, b) =>
          (toTimestamp(a.startTime ?? null) ?? 0) -
          (toTimestamp(b.startTime ?? null) ?? 0),
      )
    : [];

  let coveredSeconds = 0;
  let totalPoints = 0;

  for (const historyItem of multiplierHistory) {
    const historyStart = toTimestamp(historyItem.startTime ?? null);
    if (historyStart === null) {
      continue;
    }

    const historyEnd = historyItem.endTime
      ? toTimestamp(historyItem.endTime)
      : calcUntil;
    if (historyEnd === null) {
      continue;
    }

    const segmentStart = Math.max(startTime, historyStart);
    const segmentEnd = Math.min(calcUntil, historyEnd);
    const durationSeconds = (segmentEnd - segmentStart) / 1000;

    if (durationSeconds <= 0) {
      continue;
    }

    totalPoints +=
      durationSeconds *
      getRatePerSecond(data, Number(historyItem.multiplier) || 1);
    coveredSeconds += durationSeconds;
  }

  if (coveredSeconds < totalSessionSeconds) {
    totalPoints +=
      (totalSessionSeconds - coveredSeconds) *
      getRatePerSecond(data, data.multiplier ?? 1);
  }

  return roundCoins(totalPoints);
};

const getDisplayEarnedCoins = (data: MiningData, now = Date.now()) => {
  if (isActiveMiningSession(data)) {
    return calculateLiveEarnedCoins(data, now);
  }

  if (isClaimableMiningSession(data)) {
    return roundCoins(data.currentMiningPoints ?? data.currentApeCoins ?? 0);
  }

  return 0;
};

const deriveStateFromDB = (data: MiningData, now = Date.now()) => {
  const sessionEndTime = getSessionEndTimestamp(data);
  const liveRemainingFromTime =
    sessionEndTime === null
      ? null
      : Math.max(0, Math.ceil((sessionEndTime - getServerNow(data, now)) / 1000));

  if (typeof data.remainingSeconds === 'number') {
    const remaining =
      isActiveMiningSession(data) && liveRemainingFromTime !== null
        ? liveRemainingFromTime
        : Math.max(0, data.remainingSeconds);

    return {
      remaining,
      earnedCoins: getDisplayEarnedCoins(data, now),
      isComplete:
        remaining <= 0 ||
        data.status !== 'mining' ||
        !data.isActive,
    };
  }

  if (liveRemainingFromTime !== null) {
    return {
      remaining: liveRemainingFromTime,
      earnedCoins: getDisplayEarnedCoins(data, now),
      isComplete:
        liveRemainingFromTime <= 0 ||
        data.status !== 'mining' ||
        !data.isActive,
    };
  }

  if (data.status !== 'mining' || !data.miningStartTime) {
    return {
      remaining: 0,
      earnedCoins: getDisplayEarnedCoins(data, now),
      isComplete: true,
    };
  }

  const totalSeconds = (data.selectedHour ?? 1) * 3600;
  const remaining = Math.max(0, totalSeconds - getElapsedSeconds(data, now));

  return {
    remaining,
    earnedCoins: getDisplayEarnedCoins(data, now),
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
  const miningDataRef = useRef<MiningData | null>(null);
  const lastAutoShownClaimKeyRef = useRef<string | null>(null);
  const authRequestIdRef = useRef(0);

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

  const applyMiningData = (data: MiningData, stats?: Record<string, unknown>) => {
    const receivedAt = Date.now();
    const serverTime = toTimestamp((stats?.serverTime as string | undefined) ?? data.serverTime);

    const updatedData: MiningData = {
      ...data,
      ...(stats || {}),
      apeDollarValue:
        typeof stats?.apeDollarValue === 'number'
          ? (stats.apeDollarValue as number)
          : data.apeDollarValue ?? DEFAULT_DOLLAR_TO_BONK_RATE,
      dollarToBonkRate:
        typeof data.dollarToBonkRate === 'number' && data.dollarToBonkRate > 0
          ? data.dollarToBonkRate
          : typeof stats?.dollarToBonkRate === 'number'
            ? (stats.dollarToBonkRate as number)
            : typeof stats?.apeDollarValue === 'number'
              ? (stats.apeDollarValue as number)
              : data.apeDollarValue ?? DEFAULT_DOLLAR_TO_BONK_RATE,
      serverTime: (stats?.serverTime as string | undefined) ?? data.serverTime,
      serverTimeOffsetMs: serverTime === null ? 0 : serverTime - receivedAt,
    };

    if (Array.isArray(stats?.miningMultipliers)) {
      setMultipliers(stats?.miningMultipliers as number[]);
    }

    setMiningData(updatedData);
    setMultiplierState(updatedData.multiplier ?? 1);
    setHours(updatedData.selectedHour ?? 1);

    const { remaining, earnedCoins, isComplete } = deriveStateFromDB(updatedData);
    const claimKey =
      updatedData.miningEndTime ??
      updatedData.sessionEndTime ??
      updatedData.miningStartTime ??
      `${updatedData.email}-${updatedData.selectedHour}`;
    const canClaimReward = isComplete && isClaimableMiningSession(updatedData);

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

  const refreshMiningStatus = async () => {
    const response = await API.get('/mining/status');

    if (response.data?.mining) {
      const restoredMining = {
        ...response.data.mining,
        ...(response.data.stats ?? {}),
      };
      applyMiningData(restoredMining, response.data.stats);
      return;
    }

    resetMiningState();
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
        socketRef.current = null;
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
      });

      socket.on('disconnect', () => console.log('[socket.io] disconnected'));
    });

    return () => {
      unsubscribeAuth();
      socket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(firebaseUser => {
      const requestId = ++authRequestIdRef.current;
      resetMiningState();

      if (!firebaseUser) {
        return;
      }

      const fetchStatus = async () => {
        try {
          await refreshMiningStatus();
        } catch (error: any) {
          if (authRequestIdRef.current !== requestId) {
            return;
          }

          if (error?.response?.status === 401) {
            resetMiningState();
          }
        }
      };

      void fetchStatus();
    });

    return unsubscribeAuth;
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

    try {
      const response = await API.post('/mining/start', {
        selectedHour: h,
        selectedMiningPower: '0 - 0',
        speed: '1 KH/s',
      });
      console.log('[mining] saved to backend:', response.data?.mining?._id);
      if (response.data?.mining) {
        const restoredMining = {
          ...response.data.mining,
          ...(response.data.stats ?? {}),
        };
        applyMiningData(restoredMining, response.data.stats);
      }
    } catch (err) {
      console.error('[mining] failed to save to backend:', err);
    }
  };

  useEffect(() => {
    if (!isMining) {
      return;
    }

    const poll = setInterval(async () => {
      try {
        await refreshMiningStatus();
      } catch (e: any) {
        if (e?.response?.status === 401) {
          resetMiningState();
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
  };

  const setMultiplier = async (m: number) => {
    if (!isMining) {
      return false;
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
          response.data.stats,
        );
      }
      console.log('[mining] multiplier updated to', m);
      return true;
    } catch (err: any) {
      if (err?.response?.data?.mining) {
        applyMiningData(
          {
            ...err.response.data.mining,
            ...(err.response.data.stats ?? {}),
          },
          err.response.data.stats,
        );
      }
      console.error('[mining] failed to update multiplier:', err);
      return false;
    }
  };

  useEffect(() => {
    if (!isMining) {
      return;
    }

    const syncFromSnapshot = () => {
      const data = miningDataRef.current;
      if (!data) {
        return;
      }

      const { remaining, earnedCoins } = deriveStateFromDB(data, Date.now());
      setSecondsLeft(remaining);
      setEarned(earnedCoins);
    };

    syncFromSnapshot();
    const interval = setInterval(syncFromSnapshot, 1000);

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
        refreshMiningStatus,
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
