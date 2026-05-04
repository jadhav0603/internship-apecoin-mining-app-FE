import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TicketItem } from '../../services/ticketService';
import { TICKET_THEME } from './ticketTheme';
import styles from './TicketCard.style';


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

const TicketCard = ({ ticket, onPress }: TicketCardProps) => (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.ticketId}>{ticket.ticketId}</Text>
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

export default TicketCard;
