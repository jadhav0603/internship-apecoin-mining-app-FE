import React from 'react';
import { View, Dimensions } from 'react-native';
import DayCard from './DayCard';
import styles from './RewardsGridSection.style';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NUM_COLUMNS = 3;
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;

// Each card gets exactly 1/3 of the available width (after padding + gaps)
const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface RewardItem {
  day: number;
  amount: string;
  currency: string;
  state: 'claimable' | 'claimed' | 'locked';
}

interface RewardsGridSectionProps {
  rewards: RewardItem[];
  onCardPress: () => void;
}

const RewardsGridSection: React.FC<RewardsGridSectionProps> = ({
  rewards,
  onCardPress,
}) => {
  // Split rewards into rows of NUM_COLUMNS
  const rows: RewardItem[][] = [];
  for (let i = 0; i < rewards.length; i += NUM_COLUMNS) {
    rows.push(rewards.slice(i, i + NUM_COLUMNS));
  }

  return (
    <View style={styles.sectionWrapper}>
      {rows.map((row, rowIndex) => {
        const isLastRow = rowIndex === rows.length - 1;
        const isIncomplete = row.length < NUM_COLUMNS;

        return (
          <View
            key={rowIndex}
            style={[
              styles.row,
              // Center the last row's items if it's incomplete (e.g., Day 7 alone)
              isLastRow && isIncomplete && styles.rowCentered,
            ]}
          >
            {row.map(item => (
              <View key={item.day} style={styles.cardContainer}>
                <DayCard
                  day={item.day}
                  amount={`${item.amount} ${item.currency}`}
                  state={item.state}
                  onPress={item.state === 'claimable' ? onCardPress : undefined}
                />
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

export default RewardsGridSection;
