import React, { useMemo, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import styles from './miningTimeSelectionPopup.styles';
import { useTimeModal } from '../../context/TimeModal';
import { useMining } from '../../context/MiningContext';
import { RootStackParamList } from '../../navigation/types';

type MiningPopupNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Mining'
>;

type DurationOption = {
  hours: number;
  label: string;
  unlocked: boolean;
};

const DURATION_OPTIONS: DurationOption[] = [
  { hours: 1, label: '1 hr', unlocked: true },
  { hours: 2, label: '2 hr', unlocked: false },
  { hours: 4, label: '4 hr', unlocked: false },
  { hours: 8, label: '8 hr', unlocked: false },
  { hours: 12, label: '12 hr', unlocked: false },
];

const MiningTimeSelectionPopup = () => {
  const navigation = useNavigation<MiningPopupNavigationProp>();
  const { showModal, setShowModal } = useTimeModal();
  const { startMining } = useMining();
  const [selectedHours, setSelectedHours] = useState(1);

  const activeIndex = useMemo(
    () => DURATION_OPTIONS.findIndex(option => option.hours === selectedHours),
    [selectedHours],
  );

  const handleClose = () => {
    setShowModal(false);
    setSelectedHours(1);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    await startMining(selectedHours);
    navigation.navigate('Mining', { time: selectedHours });
  };

  return (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#21361A', '#111A0F', '#091008']}
          start={{ x: 0.12, y: 0 }}
          end={{ x: 0.88, y: 1 }}
          style={styles.modalBox}
        >
          <View style={styles.glowOrb} />

          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={20} color="#DDE7D5" />
          </TouchableOpacity>

          <Text style={styles.title}>Select Mining Duration</Text>

          <View style={styles.descriptionRow}>
            <Text style={styles.descriptionIcon}>⛏</Text>
            <Text style={styles.description}>
              Boost your mining session by selecting a longer duration. More
              time means greater rewards!
            </Text>
          </View>

          <View style={styles.selectorSection}>
            <View style={styles.optionRow}>
              {DURATION_OPTIONS.map((option, index) => {
                const isActive = option.hours === selectedHours;
                const isLocked = !option.unlocked;
                const leftConnectorActive = index > 0 && index <= activeIndex;
                const rightConnectorActive =
                  index < DURATION_OPTIONS.length - 1 && index < activeIndex;

                return (
                  <View key={option.hours} style={styles.optionItem}>
                    <View style={styles.optionVisualRow}>
                      {index > 0 ? (
                        <View
                          style={[
                            styles.connectorSegment,
                            leftConnectorActive && styles.connectorSegmentActive,
                          ]}
                        />
                      ) : (
                        <View style={styles.connectorSpacer} />
                      )}

                      <TouchableOpacity
                        activeOpacity={option.unlocked ? 0.85 : 1}
                        disabled={isLocked}
                        style={styles.optionWrap}
                        onPress={() => setSelectedHours(option.hours)}
                      >
                        <LinearGradient
                          colors={
                            isActive
                              ? ['#8DFF59', '#59D11F']
                              : ['rgba(45, 56, 43, 0.92)', 'rgba(26, 34, 24, 0.96)']
                          }
                          start={{ x: 0.15, y: 0 }}
                          end={{ x: 0.85, y: 1 }}
                          style={[
                            styles.optionCircle,
                            isActive && styles.optionCircleActive,
                            isLocked && styles.optionCircleLocked,
                          ]}
                        >
                          {isLocked ? (
                            <Text style={styles.lockIcon}>🔓</Text>
                          ) : null}
                        </LinearGradient>
                        <Text
                          style={[
                            styles.optionLabel,
                            isActive && styles.optionLabelActive,
                            isLocked && styles.optionLabelLocked,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>

                      {index < DURATION_OPTIONS.length - 1 ? (
                        <View
                          style={[
                            styles.connectorSegment,
                            rightConnectorActive && styles.connectorSegmentActive,
                          ]}
                        />
                      ) : (
                        <View style={styles.connectorSpacer} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={styles.note}>
            *Some options available for Premium or higher levels.*
          </Text>

          <TouchableOpacity activeOpacity={0.9} onPress={handleConfirm}>
            <LinearGradient
              colors={['#FFB24A', '#FF7C1F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmBtn}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default MiningTimeSelectionPopup;
