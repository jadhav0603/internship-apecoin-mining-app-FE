import { StyleSheet } from 'react-native';
import {Colors} from '../../theme/colors';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    height: 54,
  },
  containerFocused: {
    borderColor: Colors.neonGreen,
    backgroundColor: 'rgba(182,255,59,0.05)',
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
    color: '#FFFFFF',
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
