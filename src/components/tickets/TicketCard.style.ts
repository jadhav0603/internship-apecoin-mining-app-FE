import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { TICKET_THEME, getPriorityColor } from './ticketTheme';

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

export default styles;
