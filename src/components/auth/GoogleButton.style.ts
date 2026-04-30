import { StyleSheet } from 'react-native';
import {Colors} from '../../theme/colors';
import { COLORS } from '../../constants/COLORS';

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
    shadowColor: COLORS.white,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  gContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gBlue:   {fontSize: 14, fontWeight: '800', color: COLORS.googleBlue},
  gRed:    {fontSize: 14, fontWeight: '800', color: COLORS.googleRed},
  gYellow: {fontSize: 14, fontWeight: '800', color: COLORS.googleYellow},
  gGreen:  {fontSize: 14, fontWeight: '800', color: COLORS.googleGreen},
});

export default styles;
