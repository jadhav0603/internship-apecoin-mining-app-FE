import React, { useState } from 'react';
import { Text, View, Modal, TouchableOpacity } from 'react-native';
import { useTimeModal } from '../../context/TimeModal';

import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

import styles from './miningTimeSelectionPopup.styles';
import { COLORS } from '../../constants/COLORS';
import { useMining } from '../../context/MiningContext';
import { useInterstitialAd } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';
import { useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

// ✅ Typed navigation (from Testing branch)
type MiningPopupNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Mining'
>;

const SIZE = 200;
const RADIUS = 80;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MiningTimeSelectionPopup = () => {
  const navigation = useNavigation<MiningPopupNavigationProp>();

  const { showModal, setShowModal } = useTimeModal();
  const { startMining } = useMining();
  const [hours, setHours] = useState(1);
  const { isLoaded, isClosed, load, show } = useInterstitialAd(
    AD_UNITS.INTERSTITIAL_MINING,
    { requestNonPersonalizedAdsOnly: true }
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isClosed) {
      load();
    }
  }, [isClosed, load]);

  const increase = () => {
    if (hours < 12) setHours(hours + 1);
  };

  const decrease = () => {
    if (hours > 1) setHours(hours - 1);
  };

  // progress (1 → 12)
  const progress = hours / 12;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={[COLORS.backgroundLight, COLORS.backgroundDeep]}
          style={styles.modalBox}
        >
          {/* ❌ Close */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Select Duration</Text>

          {/* 🔥 Circular Dial */}
          <View style={styles.circleWrapper}>
            <Svg width={SIZE} height={SIZE}>
              {/* Track */}
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={COLORS.ringTrack}
                strokeWidth={STROKE}
                fill="none"
              />

              {/* Progress */}
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={COLORS.primary}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${SIZE / 2}, ${SIZE / 2}`}
              />
            </Svg>

            {/* Center Time */}
            <View style={styles.center}>
              <Text style={styles.timeText}>{hours}h</Text>
            </View>
          </View>

          {/* 🔽 Controls */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={decrease} style={styles.btn}>
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={increase} style={styles.btn}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* 🚀 Confirm */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => {
              if (isLoaded) {
                show();
              }
              setShowModal(false);
              startMining(hours);
              navigation.navigate('Mining', { time: hours });
            }}
          >
            <Text style={styles.confirmText}>START MINING</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default MiningTimeSelectionPopup;