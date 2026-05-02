import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  topGlow: {
    position: 'absolute',
    top: -70,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(122, 232, 91, 0.14)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -80,
    left: -30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(122, 232, 91, 0.08)',
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 19,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  card: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: 'rgba(8, 19, 12, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(154, 251, 101, 0.12)',
    overflow: 'hidden',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: 10,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },
  retryButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(154, 251, 101, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(154, 251, 101, 0.28)',
  },
  retryButtonText: {
    color: '#9AFB65',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.black,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 10,
  },
  introHeading: {
    color: '#9AFB65',
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 8,
  },
  introDescription: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  sectionCard: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 15,
    marginBottom: 8,
  },
  sectionContent: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 21,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  pointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
    backgroundColor: '#9AFB65',
  },
  pointText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(4, 10, 6, 0.92)',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxRowPressed: {
    opacity: 0.82,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 12,
    color: COLORS.textPrimary,
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonOuter: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  buttonOuterPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#06210B',
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});

export default styles;
