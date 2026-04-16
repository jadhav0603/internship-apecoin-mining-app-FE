import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MiningContextType = {
  isMining: boolean;
  secondsLeft: number;
  hours: number;
  multiplier: number;
  earned: number;
  startMining: (h: number) => void;
  stopMining: () => void;
  setMultiplier: (m: number) => void;
};

const MiningContext = createContext<MiningContextType>({} as MiningContextType);

export const MiningProvider = ({ children }: any) => {
  const [isMining, setIsMining] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [hours, setHours] = useState(1);
  const [multiplier, setMultiplierState] = useState(1);
  const [earned, setEarned] = useState(0);

  // ⚙️ CONFIG (tujha formula)
  const baseDollarValue = 0.002;
  const dollarToBonkRate = 0.00000604;

  const getRatePerSecond = () => {
    const RATE_VALUE = baseDollarValue / dollarToBonkRate;
    const bonkPerHour = RATE_VALUE * multiplier;
    return bonkPerHour / 3600;
  };

  // 🔥 START MINING
  const startMining = async (h: number) => {
    const totalSeconds = h * 3600;

    setIsMining(true);
    setHours(h);
    setSecondsLeft(totalSeconds);

    const data = {
      startTime: Date.now(),
      duration: totalSeconds,
      multiplier: 1,
      earned: 0,
    };

    await AsyncStorage.setItem('MINING_DATA', JSON.stringify(data));
  };

  // 🔥 STOP
  const stopMining = async () => {
    setIsMining(false);
    setSecondsLeft(0);
    await AsyncStorage.removeItem('MINING_DATA');
  };

  const setMultiplier = async (m: number) => {
    setMultiplierState(m);
  };

  // 🔁 TIMER ENGINE
  useEffect(() => {
    let interval: any;

    if (isMining) {
      interval = setInterval(async () => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            stopMining();
            return 0;
          }
          return prev - 1;
        });

        setEarned((prev) => prev + getRatePerSecond());
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isMining, multiplier]);

  // 🔥 RESTORE AFTER APP OPEN
  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem('MINING_DATA');
      if (!saved) return;

      const data = JSON.parse(saved);

      const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
      const remaining = data.duration - elapsed;

      if (remaining > 0) {
        setIsMining(true);
        setSecondsLeft(remaining);
        setMultiplierState(data.multiplier);
        setEarned(data.earned + elapsed * getRatePerSecond());
      }
    };

    load();
  }, []);

  return (
    <MiningContext.Provider
      value={{
        isMining,
        secondsLeft,
        hours,
        multiplier,
        earned,
        startMining,
        stopMining,
        setMultiplier,
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};

export const useMining = () => {
  const ctx = useContext(MiningContext);
  if (!ctx) throw new Error('useMining must be used inside provider');
  return ctx;
};