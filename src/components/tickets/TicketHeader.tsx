import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import AppBackButton from '../navigation/AppBackButton';
import { TICKET_THEME } from './ticketTheme';
import styles from './TicketHeader.style';


type TicketHeaderProps = {
  title: string;
  onBack: () => void;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
};

const TicketHeader = ({
  title,
  onBack,
  rightActionLabel,
  onRightActionPress,
}: TicketHeaderProps) => (
  <View style={styles.container}>
    <AppBackButton onPress={onBack} />

    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>

    {rightActionLabel ? (
      <Pressable onPress={onRightActionPress} style={styles.actionButton}>
        <Text style={styles.actionLabel}>{rightActionLabel}</Text>
      </Pressable>
    ) : (
      <View style={styles.placeholder} />
    )}
  </View>
);

export default TicketHeader;
