import React from 'react';
import { Pressable, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/COLORS';
import SegmentedRing from './SegmentedRing';
import styles from './miningButton.styles';
import { useTimeModal } from '../../context/TimeModal';
import { useMining } from '../../context/MiningContext';
type MiningButtonProps = {
  onPress?: () => void;
};

export default function MiningButton({ onPress }: MiningButtonProps) {
  const navigation = useNavigation<any>();
  const { setShowModal } = useTimeModal();
  const { isMining, hours } = useMining();

  const handleOpen = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (isMining) {
      navigation.navigate('Mining', { time: hours || 1 });
      return;
    }

    setShowModal(true);
  };

  return (
    <Pressable
      onPress={handleOpen}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressablePressed,
        isMining && { opacity: 0.82 },
      ]}
    >
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.footerText}>
          {isMining ? 'MINING IN PROGRESS' : 'TAP TO CONTINUE'}
        </Text>
        <View style={styles.cardGlow} />

        <View style={styles.ringWrapper}>
          <SegmentedRing
            size={182}
            segmentCount={56}
            activeSegments={18}
            segmentWidth={5}
            segmentHeight={18}
            rotationDuration={15000}
          >
            <LinearGradient
              colors={['rgba(129, 164, 39, 0.92)', 'rgba(34, 48, 16, 0.96)']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.innerCore}
            >
              <FontAwesome5
                name={isMining ? 'hourglass-start' : 'play'}
                size={18}
                color={COLORS.textPrimary}
                style={styles.playIcon}
              />
            </LinearGradient>
          </SegmentedRing>
        </View>

        {/* <Text style={styles.eyebrow}>MINING ENTRY</Text> */}
        <Text style={styles.title}>
  {isMining ? 'Mining Active' : 'Activate Asset Engine'}
</Text>
       <Text style={styles.subtitle}>
  {isMining
    ? 'View your active mining session and performance details.'
    : 'Begin mining and track your assets from the dashboard.'}
</Text>
      </LinearGradient>
    </Pressable>
  );
}
