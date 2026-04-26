import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A2B1A',
    borderRadius: 20,
    padding: 16,
    margin: 5,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.36)',
    zIndex: 9998,
    elevation: 998,
  },

  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    elevation: 999,
  },

  background: {
    flex: 1,
    backgroundColor: '#07100B',
  },

  greenGlow: {
    position: 'absolute',
    top: -height * 0.12,
    left: -width * 0.12,
    width: width * 0.8,
    height: height * 0.46,
    borderRadius: width * 0.4,
  },

  monkeyArtWrap: {
    position: 'absolute',
    top: height * 0.12,
    left: -width * 0.1,
    width: width * 0.6,
    height: height * 0.52,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },

  monkeyArt: {
    width: '100%',
    height: '100%',
  },

  monkeyOverlay: {
    ...StyleSheet.absoluteFill,
  },

  safeArea: {
    flex: 1,
  },

  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width < 390 ? 16 : 20,
  },

  menuCard: {
    width: '90%',
    maxWidth: 420,
    minHeight: Math.min(height * 0.7, 620),
    borderRadius: 28,
    backgroundColor: 'rgba(8, 14, 10, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(160,255,0,0.20)',
    padding: 20,
    shadowColor: '#91FF58',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },

  menuHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  headerCopy: {
    flex: 1,
    paddingRight: 14,
  },

  menuTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  menuSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.70)',
    fontSize: 14,
    lineHeight: 20,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  closeButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },

  menuList: {
    paddingBottom: 14,
  },

  menuItemCard: {
    height: 58,
    borderRadius: 18,
    marginBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(16, 24, 18, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemCardDanger: {
    backgroundColor: 'rgba(57, 17, 22, 0.88)',
    borderColor: 'rgba(255, 111, 126, 0.16)',
  },

  menuItemCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.988 }],
  },

  menuItemCardDisabled: {
    opacity: 0.72,
  },

  menuItemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(164,255,88,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(164,255,88,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuItemIconCircleDanger: {
    backgroundColor: 'rgba(255, 111, 126, 0.12)',
    borderColor: 'rgba(255, 111, 126, 0.18)',
  },

  menuItemText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  menuItemTextDanger: {
    color: '#FFD8DD',
  },

  logoutCard: {
    height: 58,
    borderRadius: 18,
    marginTop: 'auto',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(72, 20, 28, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 119, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoutCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.988 }],
  },

  logoutIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,102,119,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,102,119,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoutText: {
    flex: 1,
    color: '#FF6C7D',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default styles;
