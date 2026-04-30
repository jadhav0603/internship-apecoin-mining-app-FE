import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { TICKET_THEME } from './ticketTheme';

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

export default styles;
