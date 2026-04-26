import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import AppBackButton from '../navigation/AppBackButton';
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
