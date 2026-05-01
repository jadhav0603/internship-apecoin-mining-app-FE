import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME, getInitial } from './profileTheme';

const styles = StyleSheet.create({
  pressableContainer: {
    alignSelf: 'center',
  },
  avatarOuter: {
    marginTop: 16,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: PROFILE_THEME.avatarBorder,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: PROFILE_THEME.avatarFallbackBg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  fallbackAvatar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PROFILE_THEME.avatarFallbackBg,
  },
  initialText: {
    color: PROFILE_THEME.neonGreen,
    fontSize: 36,
    fontFamily: FONTS.black,
    fontWeight: '800',
  },
});

export default styles;
