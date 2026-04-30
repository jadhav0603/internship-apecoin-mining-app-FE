import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const SCREEN_WIDTH = Dimensions.get("window").width;

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.green900,
    borderRadius: 20,
    padding: 16,
    margin: 5,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whiteAlpha06,
  },

  overlay: {
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    // backgroundColor: COLORS.blackAlpha60,
    // zIndex: 9998,
    // elevation: 998,
  },

  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 999,
  },

  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 1,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
  },

 menuBg: {
  width: '100%',
  height: '100%',
  flex: 1,
  justifyContent: 'flex-start',
},

  menuBgImage: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    resizeMode: 'stretch',
  },

  menuOverlay: {
    flex: 1,
    // backgroundColor: COLORS.blackAlpha65,
    paddingTop: 50,
    paddingHorizontal: 18,
  },

  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  menuTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },

  menuItemBox: {
    paddingVertical: 18,
    marginBottom: 12,
    alignSelf: "flex-end",
  },

  menuItem: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "right",
  },
  logoutText: {
    color: COLORS.red,
  },
});

export default styles;
