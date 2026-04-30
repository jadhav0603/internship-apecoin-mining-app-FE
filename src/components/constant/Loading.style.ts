import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
 container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLORS.transparent, 
},
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 180,
    height: 180,
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
