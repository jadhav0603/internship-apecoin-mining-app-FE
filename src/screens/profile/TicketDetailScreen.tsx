import React, { useCallback, useState } from 'react';
import {
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
import Loading from '../../components/constant/Loading';
import TicketHeader from '../../components/tickets/TicketHeader';
import { TICKET_THEME } from '../../components/tickets/ticketTheme';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList } from '../../navigation/types';
import { ticketService, type TicketItem } from '../../services/ticketService';
import styles from './TicketDetailScreen.style';

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
            <Loading size="small" text="Loading ticket..." />
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

            {ticket.resolution ? (
              <View style={styles.detailCard}>
                <Text style={styles.sectionTitle}>Resolution</Text>
                <Text style={styles.valueText}>{ticket.resolution}</Text>
              </View>
            ) : null}

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

export default TicketDetailScreen;
