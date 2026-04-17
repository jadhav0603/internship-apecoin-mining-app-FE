import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import DayCard from './DayCard';

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
  const renderCard = ({ item }: { item: RewardItem }) => (
    <View style={styles.cardContainer}>
      <DayCard
        day={item.day}
        amount={`${item.amount} ${item.currency}`}
        state={item.state}
        onPress={item.state === 'claimable' ? onCardPress : undefined}
      />
    </View>
  );

  return (
    <View style={styles.sectionWrapper}>
      <FlatList
        data={rewards}
        renderItem={renderCard}
        keyExtractor={(item) => item.day.toString()}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    sectionWrapper: {
      width: '100%',
  paddingHorizontal: 10,
  paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(57,255,20,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Center cards in rows with fewer than three items
    marginBottom: 10,
  },
  cardContainer: {
     width: '33%',
     paddingHorizontal: 4,
     marginBottom: 10,
  },
});

export default RewardsGridSection;
