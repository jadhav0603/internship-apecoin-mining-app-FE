import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import {Colors} from '../../theme/colors';
import styles from './GoogleButton.style';


interface GoogleButtonProps {
  onPress: () => void;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Google 'G' rendered with colored letters */}
      <View style={styles.gContainer}>
        <Text style={styles.gBlue}>G</Text>
        <Text style={styles.gRed}>o</Text>
        <Text style={styles.gYellow}>o</Text>
        <Text style={styles.gBlue}>g</Text>
        <Text style={styles.gGreen}>l</Text>
        <Text style={styles.gRed}>e</Text>
      </View>
    </TouchableOpacity>
  );
};

export default GoogleButton;
