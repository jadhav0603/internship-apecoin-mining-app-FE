import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TicketHeader from '../../components/tickets/TicketHeader';
import { TICKET_THEME, getPriorityColor } from '../../components/tickets/ticketTheme';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList } from '../../navigation/types';
import { ticketService, type TicketItem } from '../../services/ticketService';

type TicketDetailRouteProp = RouteProp<RootStackParamList, 'TicketDetail'>;

const formatDateTime = (value?: string) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TicketDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<TicketDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTicket = useCallback(async (refresh = false) => {
    try {
      setErrorMessage('');
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await ticketService.getTicketById(route.params.ticketId);
      setTicket(response);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? 'Unable to load ticket details.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [route.params.ticketId]);

  useFocusEffect(
    useCallback(() => {
      fetchTicket();
    }, [fetchTicket])
  );

  const priorityColor = getPriorityColor(ticket?.priority);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 12, 28),
          paddingBottom: Math.max(insets.bottom + 24, 36),
          paddingHorizontal: 18,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchTicket(true)}
            tintColor={TICKET_THEME.accent}
          />
        }
      >
        <TicketHeader title="Ticket Details" onBack={() => navigation.goBack()} />

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={TICKET_THEME.accent} />
          </View>
        ) : errorMessage || !ticket ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Unable to load ticket</Text>
            <Text style={styles.stateDescription}>{errorMessage}</Text>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.ticketId}>{ticket.ticketId}</Text>
              <Text style={styles.category}>{ticket.category}</Text>

              <View style={styles.metaRow}>
                <View style={[styles.priorityBadge, { borderColor: priorityColor }]}>
                  <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                  <Text style={styles.priorityText}>{ticket.priority.toUpperCase()}</Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{ticket.status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{ticket.description}</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.sectionTitle}>Created At</Text>
              <Text style={styles.valueText}>{formatDateTime(ticket.createdAt)}</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.sectionTitle}>Contact Preference</Text>
              <Text style={styles.valueText}>
                {ticket.allowContact ? 'Allowed' : 'No follow-up contact requested'}
              </Text>

              {ticket.allowContact ? (
                <View style={styles.contactWrap}>
                  {ticket.contactEmail ? (
                    <Text style={styles.contactText}>Email: {ticket.contactEmail}</Text>
                  ) : null}
                  {ticket.contactPhone ? (
                    <Text style={styles.contactText}>Phone: {ticket.contactPhone}</Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.sectionTitle}>Attachments</Text>
              {ticket.attachments.length ? (
                <View style={styles.attachmentGrid}>
                  {ticket.attachments.map((attachment, index) => (
                    <Image
                      key={`${attachment}-${index}`}
                      source={{ uri: attachment }}
                      style={styles.attachmentImage}
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No attachments were added to this report.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TICKET_THEME.background,
  },
  stateCard: {
    backgroundColor: TICKET_THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  stateDescription: {
    color: TICKET_THEME.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  heroCard: {
    backgroundColor: TICKET_THEME.cardStrong,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    padding: 18,
  },
  ticketId: {
    color: TICKET_THEME.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  category: {
    color: TICKET_THEME.textPrimary,
    fontSize: 24,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: TICKET_THEME.input,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    color: TICKET_THEME.textPrimary,
    fontSize: 12,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: `${TICKET_THEME.pending}22`,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: TICKET_THEME.pending,
    fontSize: 12,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: TICKET_THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    padding: 18,
    marginTop: 14,
  },
  sectionTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    color: TICKET_THEME.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  valueText: {
    color: TICKET_THEME.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  contactWrap: {
    marginTop: 10,
    gap: 6,
  },
  contactText: {
    color: TICKET_THEME.textSecondary,
    fontSize: 14,
  },
  attachmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attachmentImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: TICKET_THEME.input,
  },
  emptyText: {
    color: TICKET_THEME.textMuted,
    fontSize: 14,
  },
});

export default TicketDetailScreen;
