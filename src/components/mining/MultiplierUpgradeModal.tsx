import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import BlurView from '../layout/BlurView'; // Assuming a BlurView component exists or we use a semi-transparent background
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useMining } from '../../context/MiningContext';

const { width, height } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;
const CENTER_SIZE = 80;

interface MultiplierUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

const MULTIPLIERS = [1, 2, 4, 8, 10, 15, 20, 25];

const MultiplierUpgradeModal: React.FC<MultiplierUpgradeModalProps> = ({
  visible,
  onClose,
}) => {
  const { multiplier, setMultiplier } = useMining();
  const [shouldRender, setShouldRender] = React.useState(visible);
  
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: 300 });
      rotation.value = 0; // No rotation on opening
    } else {
      scale.value = withTiming(0.3, { duration: 250, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(0, { duration: 250 });
      rotation.value = withTiming(-90, { duration: 250 });
      
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    // Trigger the exit animation by letting the parent update the visible prop
    onClose();
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  const handleSelect = async (m: number) => {
    await setMultiplier(m);
    handleClose();
  };

  const renderMultiplierItem = (m: number, index: number) => {
    const angle = (index * (360 / MULTIPLIERS.length)) - 90;
    const radius = WHEEL_SIZE / 2 - 40;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);

    const isActive = multiplier === m;

    return (
      <Pressable
        key={m}
        onPress={() => handleSelect(m)}
        style={[
          styles.multiplierItem,
          {
            transform: [{ translateX: x }, { translateY: y }],
            backgroundColor: isActive ? COLORS.primary : 'rgba(30, 45, 25, 0.9)',
            borderColor: isActive ? '#A6FF00' : 'rgba(166, 255, 0, 0.2)',
          },
        ]}
      >
        <Text style={[styles.multiplierText, isActive && styles.activeMultiplierText]}>
          {m}x
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        
        <Animated.View style={[styles.modalContainer, animatedContainerStyle]}>
          <View style={styles.wheelWrapper}>
            {/* Connecting Lines / Circles */}
            <View style={styles.outerRing} />
            <View style={styles.innerRing} />
            
            {/* Multiplier Items */}
            {MULTIPLIERS.map((m, i) => renderMultiplierItem(m, i))}

            {/* Center Core */}
            <View style={styles.centerCore}>
              <View style={styles.centerInner}>
                <FontAwesome5 name="rocket" size={24} color={COLORS.primary} />
                <Text style={styles.centerLabel}>BOOST</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title}>Multiplier Wheel</Text>
            <Text style={styles.subtitle}>Select a multiplier to boost your mining earnings instantly.</Text>
          </View>

          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

// We need Ionicons
import Ionicons from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    alignItems: 'center',
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: WHEEL_SIZE - 20,
    height: WHEEL_SIZE - 20,
    borderRadius: (WHEEL_SIZE - 20) / 2,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.1)',
    borderStyle: 'dashed',
  },
  innerRing: {
    position: 'absolute',
    width: CENTER_SIZE + 40,
    height: CENTER_SIZE + 40,
    borderRadius: (CENTER_SIZE + 40) / 2,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.15)',
  },
  multiplierItem: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#A6FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  multiplierText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  activeMultiplierText: {
    color: '#000',
  },
  centerCore: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  centerInner: {
    alignItems: 'center',
  },
  centerLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: FONTS.bold,
    marginTop: 2,
    letterSpacing: 1,
  },
  infoContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: FONTS.black,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default MultiplierUpgradeModal;
