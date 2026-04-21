import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: 300,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },

  title: {
    color: COLORS.textSecondary,
    marginBottom: 20,
  },

  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.ringGlow,
    shadowColor: COLORS.ringGlow,
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },

//   timeText: {
//     fontSize: 32,
//     color: COLORS.textPrimary,
//   },

  controls: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },

  btn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnText: {
    fontSize: 22,
    color: COLORS.textPrimary,
  },

  confirmBtn: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },

  confirmText: {
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
  selectedText: {
  marginTop: 12,
  fontSize: 14,
  color: COLORS.textSecondary,
},
closeBtn: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
},

closeText: {
  color: COLORS.textSecondary,
  fontSize: 18,
},

circleWrapper: {
  marginVertical: 20,
  justifyContent: 'center',
  alignItems: 'center',
},

center: {
  position: 'absolute',
  justifyContent: 'center',
  alignItems: 'center',
},

timeText: {
  fontSize: 32,
  color: COLORS.textPrimary,
},
});

export default styles;
