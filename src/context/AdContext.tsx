import React, { createContext, useContext, useState, useEffect } from 'react';
import { globalSettingsService } from '../services/globalSettingsService';
import { AD_UNITS as FALLBACK_AD_UNITS } from '../constants/AD_UNITS';
import { TestIds } from 'react-native-google-mobile-ads';

type AdUnitsContextType = {
  adUnits: typeof FALLBACK_AD_UNITS;
  loading: boolean;
};

const AdContext = createContext<AdUnitsContextType>({
  adUnits: FALLBACK_AD_UNITS,
  loading: true,
});

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adUnits, setAdUnits] = useState<typeof FALLBACK_AD_UNITS>(FALLBACK_AD_UNITS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdUnits = async () => {
      try {
        const fetchedUnits = await globalSettingsService.getAdUnits();
        if (fetchedUnits) {
          const mergedUnits = { ...FALLBACK_AD_UNITS };
          if (fetchedUnits.bannerHome) mergedUnits.BANNER_HOME = __DEV__ ? TestIds.BANNER : fetchedUnits.bannerHome;
          if (fetchedUnits.bannerProfile) mergedUnits.BANNER_PROFILE = __DEV__ ? TestIds.BANNER : fetchedUnits.bannerProfile;
          if (fetchedUnits.rewardedClaim) mergedUnits.REWARDED_CLAIM = __DEV__ ? TestIds.REWARDED : fetchedUnits.rewardedClaim;
          if (fetchedUnits.rewardedMining) mergedUnits.REWARDED_MINING = __DEV__ ? TestIds.REWARDED : fetchedUnits.rewardedMining;
          if (fetchedUnits.interstitialProfile) mergedUnits.INTERSTITIAL_PROFILE = __DEV__ ? TestIds.INTERSTITIAL : fetchedUnits.interstitialProfile;
          if (fetchedUnits.bannerWallet) mergedUnits.BANNER_WALLET = __DEV__ ? TestIds.BANNER : fetchedUnits.bannerWallet;
          if (fetchedUnits.rewardedDaily) mergedUnits.REWARDED_DAILY = __DEV__ ? TestIds.REWARDED : fetchedUnits.rewardedDaily;
          if (fetchedUnits.rewardedBoost) mergedUnits.REWARDED_BOOST = __DEV__ ? TestIds.REWARDED : fetchedUnits.rewardedBoost;
          setAdUnits(mergedUnits);
        }
      } catch (error) {
        console.error('Failed to fetch ad units:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdUnits();
  }, []);

  return <AdContext.Provider value={{ adUnits, loading }}>{children}</AdContext.Provider>;
};

export const useAds = () => useContext(AdContext);
