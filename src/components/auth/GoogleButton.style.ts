import { StyleSheet } from 'react-native';
import {Colors} from '../../theme/colors';

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#fff',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  gContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gBlue:   {fontSize: 14, fontWeight: '800', color: '#4285F4'},
  gRed:    {fontSize: 14, fontWeight: '800', color: '#EA4335'},
  gYellow: {fontSize: 14, fontWeight: '800', color: '#FBBC05'},
  gGreen:  {fontSize: 14, fontWeight: '800', color: '#34A853'},
});

export default styles;
