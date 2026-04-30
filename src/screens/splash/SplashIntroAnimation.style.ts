import { StatusBar, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundDeep,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default styles;
