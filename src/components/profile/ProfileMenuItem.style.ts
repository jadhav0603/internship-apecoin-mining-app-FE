import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME } from './profileTheme';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  pressableWrap: {
    marginBottom: 12,
  },
  pressableWrapPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha08,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  menuItemActive: {
    borderColor: COLORS.lime500Alpha24,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.12,
  },
  menuItemDanger: {
    borderColor: COLORS.red300Alpha22,
  },
  menuItemDisabled: {
    opacity: 0.7,
  },
  menuGlow: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.lime500Alpha08Tone2,
  },
  menuIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha06,
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    color: PROFILE_THEME.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  menuLabelDanger: {
    color: PROFILE_THEME.danger,
  },
  menuHint: {
    marginTop: 4,
    color: COLORS.whiteAlpha54,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 17,
  },
  menuHintDanger: {
    color: COLORS.red200Alpha66,
  },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.lime500Alpha08Tone2,
    borderWidth: 1,
    borderColor: COLORS.lime500Alpha12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  chevronWrapDanger: {
    backgroundColor: COLORS.red300Alpha08,
    borderColor: COLORS.red300Alpha14,
  },
});

export default styles;
