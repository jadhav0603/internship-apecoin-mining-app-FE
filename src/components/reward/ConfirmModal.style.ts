import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME } from '../profile/profileTheme';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.green950Alpha75,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.lime500Alpha30,
    backgroundColor: COLORS.green950Tone5,
    padding: 24,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  cardDanger: {
    borderColor: COLORS.red300Alpha30,
    shadowColor: PROFILE_THEME.danger,
  },
  title: {
    color: PROFILE_THEME.white,
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleDanger: {
    color: PROFILE_THEME.danger,
  },
  message: {
    color: COLORS.whiteAlpha70,
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: COLORS.transparent,
    borderColor: COLORS.whiteAlpha15,
  },
  confirmButtonPrimary: {
    backgroundColor: COLORS.lime500Alpha15Tone2,
    borderColor: COLORS.lime500Alpha40,
  },
  confirmButtonDanger: {
    backgroundColor: COLORS.red300Alpha15,
    borderColor: COLORS.red300Alpha40,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cancelText: {
    color: PROFILE_THEME.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  confirmTextPrimary: {
    color: PROFILE_THEME.neonGreen,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  confirmTextDanger: {
    color: PROFILE_THEME.danger,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});

export default styles;
