import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME } from '../profile/profileTheme';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 4, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(170,255,0,0.3)',
    backgroundColor: '#10160e',
    padding: 24,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  cardDanger: {
    borderColor: 'rgba(255,92,92,0.3)',
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
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  confirmButtonPrimary: {
    backgroundColor: 'rgba(170,255,0,0.15)',
    borderColor: 'rgba(170,255,0,0.4)',
  },
  confirmButtonDanger: {
    backgroundColor: 'rgba(255,92,92,0.15)',
    borderColor: 'rgba(255,92,92,0.4)',
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
