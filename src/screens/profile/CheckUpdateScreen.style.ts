import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
});

export default styles;
