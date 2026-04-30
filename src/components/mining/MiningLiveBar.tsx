import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useMining } from '../../context/MiningContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FLOATING_TAB_BAR_BASE_HEIGHT,
  FLOATING_TAB_BAR_BOTTOM_OFFSET,
  MINING_LIVE_BAR_GAP,
} from '../../constants/bottomLayout';
import styles, { getContainerStyle } from './MiningLiveBar.style';

const MiningLiveBar = () => {
  const { isMining, secondsLeft, earned } = useMining();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  if (route.name === 'Mining') return null;
  if (!isMining) return null;

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const bottomOffset =
    FLOATING_TAB_BAR_BASE_HEIGHT +
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_OFFSET +
    MINING_LIVE_BAR_GAP;

  return (
    <View style={getContainerStyle(bottomOffset)}>
      <View>
        <Text style={styles.label}>Mining in progress</Text>
        <Text style={styles.value}>
          â± {formatTime(secondsLeft)} â€¢ ðŸ’° {earned.toFixed(11)}
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate('Mining')}
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed,
        ]}
      >
        <Text style={styles.actionText}>VIEW</Text>
      </Pressable>
    </View>
  );
};

export default MiningLiveBar;
