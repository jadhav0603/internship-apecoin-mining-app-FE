import { StyleSheet } from 'react-native';
import {Colors} from '../../theme/colors';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral900,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha08,
    paddingHorizontal: 20,
    height: 54,
  },
  containerFocused: {
    borderColor: Colors.neonGreen,
    backgroundColor: COLORS.lime400Alpha05,
  },
  containerError: {
    borderColor: Colors.error,
  },
  icon: {
    fontSize: 17,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 17,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 20,
  },
});

export default styles;
