import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME } from './profileTheme';

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
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  menuItemActive: {
    borderColor: 'rgba(170,255,0,0.24)',
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.12,
  },
  menuItemDanger: {
    borderColor: 'rgba(255,92,92,0.22)',
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
    backgroundColor: 'rgba(170,255,0,0.08)',
  },
  menuIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
    color: 'rgba(255,255,255,0.54)',
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 17,
  },
  menuHintDanger: {
    color: 'rgba(255,180,180,0.66)',
  },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(170,255,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(170,255,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  chevronWrapDanger: {
    backgroundColor: 'rgba(255,92,92,0.08)',
    borderColor: 'rgba(255,92,92,0.14)',
  },
});

export default styles;
