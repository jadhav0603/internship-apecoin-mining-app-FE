import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackAlpha60,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  modalContainer: {
    width: 240,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  content: {
    padding: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  menuText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.whiteAlpha05,
    marginHorizontal: 10,
  },
});

export default styles;
