import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TICKET_THEME } from '../../components/tickets/ticketTheme';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TICKET_THEME.background,
  },
  listHeader: {
    marginBottom: 10,
  },
  separator: {
    height: 12,
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

export default styles;
