import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { THEME } from './theme';
import { COLORS } from '../../constants/COLORS';

const TOGGLE_SHELL_PADDING = 6;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionEyebrow: {
    color: COLORS.whiteAlpha50,
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    marginTop: 6,
    color: THEME.white,
    fontSize: 20,
    fontFamily: FONTS.black,
    fontWeight: '800',
  },
  sectionBadge: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.whiteAlpha06,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha08,
  },
  sectionBadgeText: {
    color: COLORS.whiteAlpha72,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  toggleShell: {
    position: 'relative',
    flexDirection: 'row',
    borderRadius: 22,
    padding: TOGGLE_SHELL_PADDING,
    backgroundColor: COLORS.green950Alpha84,
    borderWidth: 1,
    borderColor: COLORS.lime400Alpha16,
    overflow: 'hidden',
  },
  toggleIndicator: {
    position: 'absolute',
    top: TOGGLE_SHELL_PADDING,
    bottom: TOGGLE_SHELL_PADDING,
    left: TOGGLE_SHELL_PADDING,
    borderRadius: 16,
    backgroundColor: COLORS.lime700,
    borderWidth: 1,
    borderColor: COLORS.lime300Alpha40,
    shadowColor: COLORS.lime500Alpha55,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  toggleButton: {
    flex: 1,
    zIndex: 1,
    // marginHorizontal: 12,
  },
  toggleContent: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
  },
  toggleTextActive: {
    color: THEME.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    
  },
  toggleTextInactive: {
    color: COLORS.whiteAlpha48,
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  countBadgeActive: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.green950Alpha74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeInactive: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.whiteAlpha04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countTextActive: {
    color: THEME.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  countTextInactive: {
    color: COLORS.whiteAlpha54,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  listContainer: {
    marginTop: 16,
  },
  stateContainer: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  stateText: {
    marginTop: 12,
    color: THEME.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  skeletonRow: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 18,
  },
  skeletonRail: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonCard: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
    backgroundColor: COLORS.whiteAlpha04,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha08,
  },
  skeletonLineWide: {
    width: '56%',
    height: 16,
    borderRadius: 999,
    backgroundColor: COLORS.whiteAlpha08,
  },
  skeletonLineShort: {
    width: '34%',
    height: 14,
    borderRadius: 999,
    backgroundColor: COLORS.whiteAlpha06,
    marginTop: 12,
  },
  emptyContainer: {
    paddingVertical: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: COLORS.whiteAlpha04,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha06,
  },
  emptyText: {
    marginTop: 12,
    color: THEME.textMuted,
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
});

export default styles;
