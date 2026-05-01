import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;

const HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;
const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const styles = StyleSheet.create({
  sectionWrapper: {
    width: '100%',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 28,
    backgroundColor: COLORS.transparent,
  },
  row: {
    flexDirection: 'row',
    marginBottom: CARD_GAP,
  },
  // Applied only to incomplete last rows (e.g., a single Day 7 card)
  rowCentered: {
    justifyContent: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
  },
});

export default styles;
