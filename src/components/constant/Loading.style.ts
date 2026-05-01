import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.transparent,
  },
  containerFullScreen: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16,
    color: COLORS.lime400,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default styles;
