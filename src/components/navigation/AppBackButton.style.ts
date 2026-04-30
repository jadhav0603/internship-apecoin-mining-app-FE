import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow600Alpha18,
    borderWidth: 1,
    borderColor: COLORS.yellow300Alpha14,
  },
  buttonPressed: {
    opacity: 0.82,
  },
});

export default styles;
