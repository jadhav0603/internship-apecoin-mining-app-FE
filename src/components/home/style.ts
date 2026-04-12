import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS'


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1f26",
    justifyContent: "center",
    alignItems: "center",
  },

  shadowOuter: {
    width: 70,
    height: 70,
    borderRadius: 70 / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },

  innerCircle: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
    textTransform: "lowercase",
  },
});

export default styles;