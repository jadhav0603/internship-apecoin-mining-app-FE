import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMining } from '../context/MiningContext';
import {
  FLOATING_TAB_BAR_BOTTOM_OFFSET,
  MINING_LIVE_BAR_GAP,
  MINING_LIVE_BAR_HEIGHT,
} from '../constants/bottomLayout';

const useBottomOverlayPadding = (extraPadding = 0) => {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { isMining } = useMining();

  const tabBarPadding = Math.max(
    tabBarHeight + FLOATING_TAB_BAR_BOTTOM_OFFSET,
    insets.bottom + FLOATING_TAB_BAR_BOTTOM_OFFSET,
  );

  const liveBarPadding = isMining
    ? MINING_LIVE_BAR_HEIGHT + MINING_LIVE_BAR_GAP
    : 0;

  return tabBarPadding + liveBarPadding + extraPadding;
};

export default useBottomOverlayPadding;
