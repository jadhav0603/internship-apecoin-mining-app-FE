import React from 'react';
import { View, Text, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const bottomOffset =
    FLOATING_TAB_BAR_BASE_HEIGHT +
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_OFFSET +
    MINING_LIVE_BAR_GAP;

  return (
    <View style={getContainerStyle(bottomOffset)}>
      <LinearGradient
        colors={['#1d1e1d', '#02040c']}
        style={styles.gradient}
      >
        <View style={styles.glow} />

        <View style={styles.left}>
          <Text style={styles.label}>⛏ MINING LIVE</Text>
          <Text style={styles.value}>
            ⏱ {formatTime(secondsLeft)}   💰 {earned.toFixed(6)}
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Mining')}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={['#00ff00', '#78ff29']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>VIEW</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );
};

export default MiningLiveBar;