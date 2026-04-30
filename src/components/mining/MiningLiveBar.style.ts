import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: 62,
    backgroundColor: '#1A1A1A',
    padding: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    color: '#aaa',
    fontSize: 12,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: '#40a920ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  actionText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
});

export const getContainerStyle = (bottom: number) => [
  styles.container,
  { bottom },
];

export default styles;
