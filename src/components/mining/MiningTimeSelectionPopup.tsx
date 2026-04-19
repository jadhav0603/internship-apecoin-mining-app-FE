import React, { useState } from 'react';
import { Text, View, Modal, TouchableOpacity } from 'react-native';
import { useTimeModal } from '../../context/TimeModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type MiningPopupNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Mining'
>;

const MiningTimeSelectionPopup = () => {
    const navigation = useNavigation<MiningPopupNavigationProp>();
  const { showModal, setShowModal } = useTimeModal();
  const [selectedTime, setSelectedTime] = useState(1);

  return (
    <View>
      <Modal visible={showModal} transparent animationType="fade">
        <View >
          <View >
            <Text>Select Mining Duration</Text>

            <TouchableOpacity onPress={() => setSelectedTime(1)}>
              <Text>1 Hour</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedTime(5)}>
              <Text>5 Hours</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedTime(12)}>
              <Text>12 Hours</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                navigation.navigate('Mining', { time: selectedTime });
              }}
            >
              <Text>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MiningTimeSelectionPopup;
