import React from 'react';
import { Pressable, View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { COLORS } from '../../constants/COLORS';
import SegmentedRing from '../mining/SegmentedRing';
import styles from './miningButton.styles';

type MiningButtonProps = {
  onPress?: () => void;
};

export default function MiningButton({ onPress }: MiningButtonProps) {
  return (
    <Pressable style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}>
      <LinearGradient
        colors={['rgba(78, 102, 22, 0.78)', 'rgba(12, 17, 8, 0.94)']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        style={styles.card}>
        <View style={styles.cardGlow} />

        <Pressable onPress={onPress} style={styles.ringWrapper}>
          <SegmentedRing
            size={182}
            segmentCount={56}
            activeSegments={18}
            segmentWidth={5}
            segmentHeight={18}
            rotationDuration={15000}>
            <LinearGradient
              colors={['rgba(129, 164, 39, 0.92)', 'rgba(34, 48, 16, 0.96)']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.innerCore}>
              <FontAwesome5 name="play" size={18} color={COLORS.textPrimary} style={styles.playIcon} />
            </LinearGradient>
          </SegmentedRing>
        </Pressable>

        <Text style={styles.eyebrow}>MINING ENTRY</Text>
        <Text style={styles.title}>Start Generating Assets </Text>
        <Text style={styles.subtitle}>Tap to launch the neon time-storage dashboard.</Text>
      </LinearGradient>
    </Pressable>
  );
}
