import {
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundFill: {
    ...StyleSheet.absoluteFill,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
    letterSpacing: 0.3,
  },
  headerSpacer: { width: 42 },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 40,
  },

  // ── States ──
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCard: {
    minHeight: 130,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  stateText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Cards ──
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },

  // ── Card title ──
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(166,255,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(166,255,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 1,
  },

  // ── Card body ──
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 23,
    letterSpacing: 0.1,
  },

  // ── Inline highlighted value ──
  inlineHighlight: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // ── Social ──
  socialCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16, // slightly reduced gap to help them fit
    marginTop: 10,
    width: '100%',
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: 70,
  },
  socialIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 1, // for border effect
    overflow: 'hidden',
  },
  socialIconGlass: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 17,
  },
  socialLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  // ── Avatar ──
  avatarWrapper: {
    alignSelf: 'center',
    width: 140,
    height: 180,
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});

export default styles;
