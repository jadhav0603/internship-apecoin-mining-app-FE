import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: 62,
    backgroundColor: COLORS.neutral900Tone2,
    padding: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    color: COLORS.neutral300,
    fontSize: 12,
  },
  value: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: COLORS.green600Tone2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  actionText: {
    color: COLORS.black,
    fontWeight: '700',
    fontSize: 13,
  },
});

export const getContainerStyle = (bottom: number) => [
  styles.container,
  { bottom },
];

export default styles;
