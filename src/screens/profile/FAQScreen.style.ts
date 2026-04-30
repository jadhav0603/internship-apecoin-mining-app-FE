import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
  },
  headerSafeArea: {
    width: '100%',
  },
  headerContent: {
    minHeight: 96,
    paddingHorizontal: 18,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 42,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 29,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardMuted,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: COLORS.cardStrong,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(166, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.18)',
    marginRight: 12,
  },
  emojiIcon: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  question: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: FONTS.bold,
  },
  chevron: {
    marginLeft: 10,
    marginTop: 1,
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  answer: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
    fontFamily: FONTS.regular,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardMuted,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 10,
    fontFamily: FONTS.medium,
  },
});

export default styles;
