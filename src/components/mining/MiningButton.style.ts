import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  shell: {
    borderRadius: 32,
    overflow: 'hidden',
    padding: 1.5,
    backgroundColor: COLORS.whiteAlpha05,
  },
  borderBeam: {
    position: 'absolute',
    width: '300%',
    height: '300%',
    top: '-100%',
    left: '-100%',
  },
  borderBeamFill: {
    flex: 1,
  },
  pressable: {
    width: '100%',
      height: '100%', 
  alignItems: 'center',   
  justifyContent: 'center', 
  },
  pressablePressed: {
    opacity: 0.92,

  },
  centerWrapper: {
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
},

centerWrap: {
  width: 90,
  height: 90,
  alignItems: 'center',
  justifyContent: 'center',
},

absoluteCenter: {
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
},

centerGlow: {
  position: 'absolute',
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: COLORS.primary,
  opacity: 0.3,
},

// centerGlow: {
//   position: 'absolute',
//   width: 60,
//   height: 60,
//   borderRadius: 30,
//   backgroundColor: COLORS.primary,
//   opacity: 0.3,
// },

iconWrapper: {
  width: 40,
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
},


  card: {
    overflow: 'hidden',
    borderRadius: 32,
    // borderWidth: 1,
    // borderColor: COLORS.glassBorder,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    backgroundColor: COLORS.cardMuted,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.24,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -24,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.surfaceGlow,
    opacity: 0.42,
  },
  ringWrapper: {
    marginBottom: 18,
  },
  innerCore: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapIcon: {
    textShadowColor: COLORS.lime500Alpha22,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  idleCueWrap: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleHalo: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.lime500Alpha18,
  },
  idlePulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.yellow300Alpha38,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  idleTapRipple: {
    position: 'absolute',
    top: 9,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.whiteAlpha22,
    backgroundColor: COLORS.lime500Alpha08,
  },
  idleTapHint: {
    position: 'absolute',
    bottom: 3,
    color: COLORS.success,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: FONTS.letterSpacing.ultraWide,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  eyebrow: {
    color: COLORS.success,
    fontSize: 11,
    letterSpacing: FONTS.letterSpacing.ultraWide,
    fontFamily: FONTS.semibold,
    // marginBottom: 10,
    position: 'relative',
    bottom: 45,
    
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    marginBottom: 8,
    marginTop: -15,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    maxWidth: 260,
  },
    footerText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: FONTS.letterSpacing.wide,
  },
});

export default styles;
