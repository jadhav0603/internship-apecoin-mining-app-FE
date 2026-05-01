import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
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
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  subTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 40,
  },
  socialIcon: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 50,
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
});

export default styles;
