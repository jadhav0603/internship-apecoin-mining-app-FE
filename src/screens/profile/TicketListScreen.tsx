import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TicketCard from '../../components/tickets/TicketCard';
import TicketHeader from '../../components/tickets/TicketHeader';
import { TICKET_THEME } from '../../components/tickets/ticketTheme';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList } from '../../navigation/types';
import { ticketService, type TicketItem } from '../../services/ticketService';

const TicketListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTickets = useCallback(async (refresh = false) => {
    try {
      setErrorMessage('');
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await ticketService.getTickets();
      setTickets(response);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? 'Unable to load tickets right now.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={item => item.ticketId}
        renderItem={({ item }) => (
          <TicketCard
            ticket={item}
            onPress={() => navigation.navigate('TicketDetail', { ticketId: item.ticketId })}
          />
        )}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 12, 28),
          paddingBottom: Math.max(insets.bottom + 24, 36),
          paddingHorizontal: 18,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <TicketHeader title="My Reports" onBack={() => navigation.goBack()} />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.stateWrap}>
              <ActivityIndicator color={TICKET_THEME.accent} />
            </View>
          ) : (
            <View style={styles.stateWrap}>
              <Text style={styles.stateTitle}>
                {errorMessage ? 'Something went wrong' : 'No reports found'}
              </Text>
              <Text style={styles.stateDescription}>
                {errorMessage || 'Your submitted reports will show up here.'}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchTickets(true)}
            tintColor={TICKET_THEME.accent}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TICKET_THEME.background,
  },
  listHeader: {
    marginBottom: 10,
  },
  stateWrap: {
    flex: 1,
    backgroundColor: TICKET_THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
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
});

export default TicketListScreen;
