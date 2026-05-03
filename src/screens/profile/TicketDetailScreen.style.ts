import {
  Image,
  RefreshControl,
  ScrollView,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 18,
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

export default styles;
