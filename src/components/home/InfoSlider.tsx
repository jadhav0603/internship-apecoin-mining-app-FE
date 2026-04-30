import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Text, TouchableOpacity, View, Dimensions, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { useReferralData } from '../../hooks/useReferralData';
import styles from './InfoSlider.style';


const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Exactly matches MiningButton width (width - 2*20 padding)
const GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + GAP;
// const SIDE_PADDING = 0; // No extra padding needed as it's already inside ScrollView padding

// SIDE_PADDING formula is correct, but we set it to 0 as it's already inside parent padding.
const SIDE_PADDING = 0;

const InfoSlider = () => {
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);
  const { referralPercentage } = useReferralData();

  const INFO_DATA = [
    {
      id: 'daily-reward',
      title: 'Daily Rewards',
      description: 'Claim your daily $APE yield and maintain your streak to unlock exclusive reward multipliers.',
      icon: (color: string) => <MaterialCommunityIcons name="gift-outline" size={24} color={color} />,
      route: 'Reward',
      isTab: true,
    },
    {
      id: 'mining',
      title: 'Active Mining',
      description: 'Optimize your mining hash rate with advanced hardware and stay active to maximize your $APE yield.',
      icon: (color: string) => <MaterialCommunityIcons name="pickaxe" size={24} color={color} />,
      route: 'Mining',
      isTab: false,
    },
    {
      id: 'referral',
      title: 'Refer & Earn',
      description: `Expand the APE community and secure a ${referralPercentage || 5}% lifetime bonus from your network's successful mining sessions.`,
      icon: (color: string) => <Ionicons name="people-outline" size={24} color={color} />,
      route: 'ReferAndEarn',
      isTab: false,
    },
    {
      id: 'apecoin',
      title: 'ApeCoin (APE)',
      description: 'The native governance and utility token empowering the decentralized APE ecosystem and future of Web3.',
      icon: (color: string) => <Ionicons name="information-circle-outline" size={24} color={color} />,
      route: 'Wallet',
      isTab: true,
    },
  ];

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      let nextIndex = indexRef.current + 1;
      if (nextIndex >= INFO_DATA.length) {
        nextIndex = 0;
      }

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      indexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
    }, 3500);
  }, [INFO_DATA.length]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const handlePress = (item: typeof INFO_DATA[0]) => {
    if (item.isTab) {
      navigation.navigate('MainTabs', { screen: item.route });
    } else {
      navigation.navigate(item.route);
    }
  };

  const onMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffset / SNAP_INTERVAL);
    indexRef.current = newIndex;
    setCurrentIndex(newIndex);
  };

  const renderItem = ({ item }: { item: typeof INFO_DATA[0] }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => handlePress(item)}
      onPressIn={stopAutoPlay}
      onPressOut={startAutoPlay}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={['rgba(34, 48, 20, 0.45)', 'rgba(18, 26, 18, 0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          {item.icon(COLORS.primary)}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={INFO_DATA}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="center"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          contentContainerStyle={styles.listContent}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollBeginDrag={stopAutoPlay}
          onScrollEndDrag={startAutoPlay}
          getItemLayout={(_, index) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * index,
            index,
          })}
        />

        {/* Subtle Gradient Fades */}
        <LinearGradient
          colors={[COLORS.background, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.leftFade}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', COLORS.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.rightFade}
          pointerEvents="none"
        />
      </View>
      
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {INFO_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default InfoSlider;
