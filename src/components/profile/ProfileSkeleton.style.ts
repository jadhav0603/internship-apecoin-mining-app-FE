import { StyleSheet } from 'react-native';
import { PROFILE_THEME } from './profileTheme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PROFILE_THEME.skeletonBg,
  },
  namePlaceholder: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: PROFILE_THEME.skeletonBg,
    marginTop: 18,
  },
  handlePlaceholder: {
    width: 100,
    height: 14,
    borderRadius: 6,
    backgroundColor: PROFILE_THEME.skeletonBg,
    marginTop: 10,
  },
});

export default styles;
