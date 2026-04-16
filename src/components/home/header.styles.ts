import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const SCREEN_WIDTH = Dimensions.get("window").width;


const styles = StyleSheet.create({
  main: {
    padding: 5,
  },
  container: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(9, 14, 7, 0.78)',
    padding: 18,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A2B1A',
    borderRadius: 20,
    padding: 16,
  },
  eyebrow: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 12,
    letterSpacing: FONTS.letterSpacing.wide,
    marginBottom: 6,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 30,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(166, 255, 0, 0.08)',
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginBottom: 4,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },


  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },

  
  menuContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    width: SCREEN_WIDTH * 0.78,
    zIndex: 2,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
  },

  menuBg: {
    flex: 1,
  },

  menuBgImage: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingTop: 50,
    paddingHorizontal: 18,
  },

  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  menuTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  menuItemBox: {
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-end",
  },

  menuItem: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
  },



  UserContainer: {
    backgroundColor: '#1A2B1A',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#A6FF00',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },

  plan: {
    backgroundColor: '#A6FF00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  planText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },

  email: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },

  menuBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  menuIcon: {
    color: '#fff',
    fontSize: 18,
  },


});

export default styles;
