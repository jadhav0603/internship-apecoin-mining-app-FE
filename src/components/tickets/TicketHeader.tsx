import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { TICKET_THEME } from './ticketTheme';

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
    <Pressable onPress={onBack} style={styles.iconButton}>
      <Ionicons name="chevron-back" size={22} color={TICKET_THEME.textPrimary} />
    </Pressable>

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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: TICKET_THEME.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: TICKET_THEME.textPrimary,
    fontSize: 24,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  actionButton: {
    minWidth: 44,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: TICKET_THEME.accent,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
});

export default TicketHeader;
