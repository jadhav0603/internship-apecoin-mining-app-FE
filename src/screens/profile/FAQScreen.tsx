import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import AppBackButton from '../../components/navigation/AppBackButton';
import Loading from '../../components/constant/Loading';
import styles from './FAQScreen.style';
import {
  FaqItem,
  globalSettingsService,
} from '../../services/globalSettingsService';

const HEADER_TITLE = 'Frequently Asked Questions';
const EMPTY_MESSAGE = 'No FAQs available';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const isEmojiIcon = (icon?: string) =>
  Boolean(icon && /[^\w-]/u.test(icon));

type FAQItemProps = {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
};

const FAQItem = memo(({ item, expanded, onToggle }: FAQItemProps) => {
  const iconIsEmoji = isEmojiIcon(item.icon);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : undefined,
      ]}
      onPress={onToggle}
    >
      <View style={styles.iconWrap}>
        {iconIsEmoji ? (
          <Text style={styles.emojiIcon}>{item.icon}</Text>
        ) : (
          <Ionicons
            name={(item.icon || 'help-circle-outline') as any}
            size={22}
            color={COLORS.primary}
          />
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.questionRow}>
          <Text style={styles.question}>{item.question}</Text>
          <Ionicons
            name="chevron-down"
            size={19}
            color={expanded ? COLORS.primary : COLORS.textMuted}
            style={[
              styles.chevron,
              expanded ? styles.chevronExpanded : undefined,
            ]}
          />
        </View>

        {expanded ? <Text style={styles.answer}>{item.answer}</Text> : null}
      </View>
    </Pressable>
  );
});

const FAQScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const animateToggle = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 240,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }, []);

  const fetchFaq = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(false);

    try {
      const faqItems = await globalSettingsService.getFaq();
      setItems(faqItems);
      setExpandedIndex(null);
    } catch {
      setError(true);
      setItems([]);
      setExpandedIndex(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchFaq();
    }, [fetchFaq])
  );

  useEffect(() => {
    return () => {
      setExpandedIndex(null);
    };
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: FaqItem; index: number }) => (
      <FAQItem
        item={item}
        expanded={expandedIndex === index}
        onToggle={() => {
          animateToggle();
          setExpandedIndex(current => (current === index ? null : index));
        }}
      />
    ),
    [animateToggle, expandedIndex]
  );

  const keyExtractor = useCallback(
    (item: FaqItem, index: number) => `${item.question}-${index}`,
    []
  );

  const emptyState = useMemo(
    () => (
      <View style={styles.emptyCard}>
        <Ionicons
          name={error ? 'cloud-offline-outline' : 'chatbubble-ellipses-outline'}
          size={30}
          color={COLORS.primary}
        />
        <Text style={styles.emptyText}>{EMPTY_MESSAGE}</Text>
      </View>
    ),
    [error]
  );

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[
          COLORS.backgroundGradientStart,
          COLORS.backgroundGradientMid,
          COLORS.backgroundGradientEnd,
        ]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <AppBackButton onPress={() => navigation.goBack()} />
            <Text style={styles.headerTitle}>{HEADER_TITLE}</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <Loading fullScreen size="medium" text="Loading FAQs..." />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            !items.length ? styles.listContentEmpty : undefined,
          ]}
          ListEmptyComponent={emptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void fetchFaq(true)}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
        />
      )}
    </View>
  );
};

export default FAQScreen;
