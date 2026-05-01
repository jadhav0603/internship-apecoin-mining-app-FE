import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME, getInitial } from './profileTheme';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.green950Alpha82,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shadowContainer: {
    width: '100%',
    maxWidth: 380,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  cardWrapper: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2, // Gradient border thickness
    backgroundColor: COLORS.green950Tone5,
  },
  rotatingGradient: {
    position: 'absolute',
    width: '150%',
    height: '150%',
  },
  cardInner: {
    width: '100%',
    borderRadius: 30, // matches wrapper radius - padding
    backgroundColor: COLORS.green950Alpha98Tone2,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 26,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: PROFILE_THEME.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whiteAlpha04,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha06,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginTop: 28,
    marginBottom: 30,
  },
  avatarOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: PROFILE_THEME.neonGreen,
    backgroundColor: COLORS.green900Tone2,
    padding: 3,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  avatarInner: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 49,
    backgroundColor: PROFILE_THEME.avatarFallbackBg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  fallbackAvatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral500,
  },
  initialText: {
    color: PROFILE_THEME.white,
    fontSize: 34,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  cameraButton: {
    position: 'absolute',
    right: -2,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PROFILE_THEME.neonGreen,
    borderWidth: 2,
    borderColor: COLORS.green900Tone3,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    color: COLORS.whiteAlpha62,
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    marginBottom: 10,
    paddingLeft: 4,
  },
  fieldBox: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha06,
    backgroundColor: COLORS.green900Tone4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  fieldBoxPressed: {
    opacity: 0.9,
  },
  emailBox: {
    backgroundColor: COLORS.green900Tone5,
  },
  fieldValue: {
    color: PROFILE_THEME.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  emailValue: {
    color: COLORS.whiteAlpha62,
  },
  logoutButton: {
    height: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.red300Alpha35,
    backgroundColor: COLORS.orange900Alpha92,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  logoutButtonPressed: {
    opacity: 0.92,
  },
  logoutButtonDisabled: {
    opacity: 0.78,
  },
  logoutText: {
    color: PROFILE_THEME.danger,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginLeft: 10,
  },
  editBox: {
    borderColor: COLORS.lime500Alpha40,
    backgroundColor: COLORS.green900Tone6,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 12,
  },
});

export default styles;
