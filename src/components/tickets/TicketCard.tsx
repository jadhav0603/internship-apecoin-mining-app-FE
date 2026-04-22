import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { TicketItem } from '../../services/ticketService';
import { TICKET_THEME, getPriorityColor } from './ticketTheme';

type TicketCardProps = {
  ticket: TicketItem;
  onPress?: () => void;
};

const formatDate = (value?: string) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const TicketCard = ({ ticket, onPress }: TicketCardProps) => {
  const priorityColor = getPriorityColor(ticket.priority);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.ticketId}>{ticket.ticketId}</Text>
        <View style={[styles.priorityBadge, { borderColor: priorityColor }]}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={styles.priorityText}>{ticket.priority.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.category}>{ticket.category}</Text>

      <View style={styles.footer}>
        <Text style={styles.metaText}>{formatDate(ticket.createdAt)}</Text>
        <View style={styles.pendingWrap}>
          <Text style={styles.pendingText}>{ticket.status}</Text>
          {onPress ? (
            <Ionicons name="chevron-forward" size={16} color={TICKET_THEME.textMuted} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: TICKET_THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketId: {
    color: TICKET_THEME.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: TICKET_THEME.input,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    color: TICKET_THEME.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  category: {
    color: TICKET_THEME.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginTop: 14,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: TICKET_THEME.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  pendingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingText: {
    color: TICKET_THEME.pending,
    fontSize: 13,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
});

export default TicketCard;
