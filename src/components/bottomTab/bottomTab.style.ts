import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const SIZE = 75;

const styles = StyleSheet.create({
  buttonBase: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonInactive: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonActive: {
    position: 'absolute', 
    top: -20,             

    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,

    backgroundColor: COLORS.primary,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: COLORS.textPrimary,
    shadowOpacity: 9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});

export default styles;