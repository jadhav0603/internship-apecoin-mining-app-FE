import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { ISSUE_PRIORITIES, TICKET_THEME, getPriorityColor } from './ticketTheme';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TICKET_THEME.inputBorder,
    backgroundColor: TICKET_THEME.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    color: TICKET_THEME.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  labelActive: {
    color: TICKET_THEME.textPrimary,
  },
});

export default styles;
