import { StyleSheet } from 'react-native';
import {Colors} from '../../theme/colors';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.neonGreen,
    borderRadius: 30,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  label: {
    color: COLORS.neutral950,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default styles;
