import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SegmentedRing from '../../components/mining/SegmentedRing';
import { COLORS } from '../../constants/COLORS';
import styles from './mining.styles';
import { useMining } from '../../context/MiningContext';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LAYOUT } from '../../constants/LAYOUT';
import MiningActionButton from '../../components/mining/MiningActionButton';
import MultiplierUpgradeModal from '../../components/mining/MultiplierUpgradeModal';
import { useTimeModal } from '../../context/TimeModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MiningScreen = () => {
  const { earned, secondsLeft, hours, miningData, multiplier, multipliers, setMultiplier } =
    useMining();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { setShowModal } = useTimeModal();
  const [multiplierModalVisible, setMultiplierModalVisible] = React.useState(false);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');

    return `${h}:${m}:${s}`;
  };

  return (
    <LinearGradient
      colors={[
        COLORS.backgroundGradientStart,
        COLORS.backgroundGradientMid,
        COLORS.backgroundGradientEnd,
      ]}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 0.88, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenGlowTop} />
        <View style={styles.screenGlowBottom} />

        <View style={styles.topBar}>
          <View style={styles.profileChip}>
            <Pressable
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#f6f2f2" />
            </Pressable>
          </View>

          {/* <View style={styles.topActions}>
            <View style={styles.topActionButton}>
              <FontAwesome5 name="plus" size={14} color={COLORS.textPrimary} />
            </View>
            <View style={styles.topActionButton}>
              <FontAwesome5 name="bell" size={14} color={COLORS.textPrimary} />
            </View>
          </View> */}
        </View>

        <View style={styles.content}>
          <View style={styles.coinCluster}>
            <View style={styles.coinAura} />
            <Svg width={240} height={170} style={styles.orbitSvg}>
              <Defs>
                <RadialGradient id="coinGlow" cx="50%" cy="50%" r="55%">
                  <Stop offset="0%" stopColor="rgba(221, 255, 120, 0.42)" />
                  <Stop offset="70%" stopColor="rgba(160, 214, 60, 0.12)" />
                  <Stop offset="100%" stopColor="rgba(160, 214, 60, 0)" />
                </RadialGradient>
              </Defs>
              <Circle cx="120" cy="78" r="52" fill="url(#coinGlow)" />
              <Ellipse
                cx="120"
                cy="92"
                rx="76"
                ry="16"
                stroke="rgba(255,255,255,0.62)"
                strokeWidth="2"
                fill="transparent"
              />
              <Ellipse
                cx="120"
                cy="88"
                rx="88"
                ry="22"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth="2"
                fill="transparent"
              />
            </Svg>

            <LinearGradient
              colors={['rgba(229, 255, 141, 0.42)', 'rgba(76, 105, 19, 0.94)']}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={styles.coinBadge}
            >
              <View style={styles.coinBadgeInner}>
                <FontAwesome5 name="dollar-sign" size={32} color="#F4FFC4" />
              </View>
            </LinearGradient>
            <View style={styles.coinBaseGlow} />
          </View>

          {/* <Text style={styles.rateText}>0.02083 Kryptons/hour</Text> */}
          <Text style={styles.amountText}>{earned.toFixed(6)} APE</Text>

          <View style={styles.ringSection}>
            <SegmentedRing
              size={320}
              segmentCount={72}
              activeSegments={24}
              segmentWidth={7}
              segmentHeight={24}
              rotationDuration={18000}
            >
              <LinearGradient
                colors={['rgba(84, 112, 24, 0.96)', 'rgba(22, 32, 12, 0.96)']}
                start={{ x: 0.15, y: 0.05 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.timerCore}
              >
                <View style={styles.timerCoreGlow} />
                {/* <View style={styles.playButton}>
                  <FontAwesome5 name="play" size={25} color={COLORS.textPrimary} style={styles.playIcon} />
                </View> */}
                <Text style={styles.storageLabel}>Time Storage</Text>
                <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              </LinearGradient>
            </SegmentedRing>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginVertical: 15,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            {/* ACTION BUTTONS */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 }}>
              <MiningActionButton
                label="Purchase Speed"
                icon="bolt"
                accentColor="#00E5FF"
                onPress={() => setShowModal(true)}
              />
              <MiningActionButton
                label="Upgrade Multiplier"
                icon="rocket"
                accentColor={COLORS.primary}
                onPress={() => setMultiplierModalVisible(true)}
              />
            </View>

            {/* STATS CARD */}
            <LinearGradient
              colors={['rgba(39, 57, 15, 0.9)', 'rgba(10, 15, 8, 0.96)']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statsHeader}>
                <View>
                  <Text style={styles.statsLabel}>MINING STATUS</Text>
                  <Text style={styles.statsTitle}></Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>LIVE</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricsRow}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricValue}>{hours}h</Text>
                  <Text style={styles.metricCaption}>Selected Timer</Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricValue}>
                    {(miningData?.totalEarned || 0).toFixed(6)}
                  </Text>
                  <Text style={styles.metricCaption}>Mined Balance</Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={[styles.metricValue, { color: COLORS.primary }]}>
                    {multiplier}x
                  </Text>
                  <Text style={styles.metricCaption}>Multiplier</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
      <MultiplierUpgradeModal
        visible={multiplierModalVisible}
        onClose={() => setMultiplierModalVisible(false)}
      />
    </LinearGradient>
  );
};

export default MiningScreen;
