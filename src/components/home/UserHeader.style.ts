import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.green900,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  avatarContainer: {
  width: 60,
  height: 60,
  borderRadius: 30,
  overflow: 'hidden',
  borderWidth: 2,
  borderColor: COLORS.successNeon,
  marginRight: 12,
},

avatar: {
  width: '100%',
  height: '100%',
},

avatarFallback: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},

avatarText: {
  color: COLORS.white,
  fontSize: 22,
  fontWeight: 'bold',
},

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // avatar: {
  //   width: 50,
  //   height: 50,
  //   borderRadius: 25,
  //   marginRight: 12,
  //   borderWidth: 2,
  //   borderColor: COLORS.activeBorder,
  // },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },

  plan: {
    backgroundColor: COLORS.activeBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  planText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '600',
  },

  email: {
    color: COLORS.whiteAlpha50,
    fontSize: 13,
  },
  loadingText: {
    color: COLORS.white,
  },

  menuBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.whiteAlpha10,
  },

  menuIcon: {
    color: COLORS.white,
    fontSize: 18,
  },
});

export default styles;
