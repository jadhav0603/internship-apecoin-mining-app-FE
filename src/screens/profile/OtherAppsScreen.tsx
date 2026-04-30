import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import AppBackButton from '../../components/navigation/AppBackButton';
import { globalSettingsService } from '../../services/globalSettingsService';
import type { OtherAppItem } from '../../services/globalSettingsService';
import styles from './OtherAppsScreen.style';

const JUNGLE_BACKGROUND = require('../../assets/images/daily_reward_background.webp');
const APP_ICONS: Record<string, ImageSourcePropType> = {
  'pengu.png': require('../../assets/images/Pengu-icon.png'),
  pengu: require('../../assets/images/Pengu-icon.png'),
  'floki.png': require('../../assets/images/Floki_icon.png'),
  floki: require('../../assets/images/Floki_icon.png'),
  'xrp.png': require('../../assets/images/xrp.png'),
  xrp: require('../../assets/images/xrp.png'),
  'babydoge.png': require('../../assets/images/Baby_doge_icon.png'),
  babydoge: require('../../assets/images/Baby_doge_icon.png'),
  'baby_doge_icon.png': require('../../assets/images/Baby_doge_icon.png'),
};

const normalizeIconKey = (icon: string) =>
  icon.trim().toLowerCase().replace(/\s+/g, '');

const resolveIcon = (icon: string) => {
  const iconKey = normalizeIconKey(icon);
  return APP_ICONS[iconKey] ?? APP_ICONS[iconKey.replace(/-/g, '_')];
};

const ItemSeparator = () => <View style={styles.separator} />;

type AppCardProps = {
  app: OtherAppItem;
  onOpen: (app: OtherAppItem) => void;
};

const AppCard = memo(({ app, onOpen }: AppCardProps) => {
  const iconSource = resolveIcon(app.icon);
  const gradient = app.gradient?.length === 2
    ? app.gradient
    : [COLORS.primary, COLORS.primaryDark];
  const disabled = app.comingSoon;

  return (
    <LinearGradient
      colors={[`${app.accentColor}B8`, 'rgba(255,255,255,0.08)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardBorder}
    >
      <View style={styles.card}>
        <View
          style={[
            styles.cardGlow,
            {
              backgroundColor: app.accentColor,
              shadowColor: app.accentColor,
            },
          ]}
        />

        <View style={styles.cardTopRow}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconFrame}
          >
            {iconSource ? (
              <Image source={iconSource} style={styles.icon} />
            ) : (
              <Text style={styles.iconFallback}>{app.name.charAt(0)}</Text>
            )}
            {disabled ? (
              <View style={styles.lockDot}>
                <Ionicons name="lock-closed" size={11} color="#FFFFFF" />
              </View>
            ) : null}
          </LinearGradient>

          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>
                {app.name}
              </Text>
              {app.badge ? (
                <View
                  style={[
                    styles.badge,
                    {
                      borderColor: `${app.accentColor}66`,
                      backgroundColor: `${app.accentColor}1F`,
                    },
                  ]}
                >
                  <Text
                    style={[styles.badgeText, { color: app.accentColor }]}
                    numberOfLines={1}
                  >
                    {app.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.tagline} numberOfLines={1}>
              {app.tagline}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {app.description}
            </Text>
          </View>
        </View>

        <Pressable
          disabled={disabled}
          onPress={() => onOpen(app)}
          style={({ pressed }) => [
            styles.buttonPressable,
            pressed && !disabled ? styles.buttonPressed : undefined,
          ]}
        >
          <LinearGradient
            colors={
              disabled
                ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.05)']
                : gradient
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              !disabled
                ? {
                    shadowColor: app.accentColor,
                  }
                : undefined,
            ]}
          >
            <Ionicons
              name={disabled ? 'time-outline' : 'open-outline'}
              size={17}
              color={disabled ? COLORS.textMuted : '#FFFFFF'}
            />
            <Text
              style={[
                styles.buttonText,
                disabled ? styles.buttonTextDisabled : undefined,
              ]}
            >
              {disabled ? 'Coming Soon' : 'Open App'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
});

type AppListProps = {
  apps: OtherAppItem[];
  error: boolean;
  refreshing: boolean;
  onOpen: (app: OtherAppItem) => void;
  onRefresh: () => void;
};

const AppList = memo(
  ({ apps, error, refreshing, onOpen, onRefresh }: AppListProps) => {
    const renderItem = useCallback(
      ({ item }: { item: OtherAppItem }) => (
        <AppCard app={item} onOpen={onOpen} />
      ),
      [onOpen],
    );

    const emptyState = useMemo(
      () => (
        <View style={styles.emptyCard}>
          <Ionicons
            name={error ? 'cloud-offline-outline' : 'apps-outline'}
            size={32}
            color={COLORS.primary}
          />
          <Text style={styles.emptyText}>
            {error ? 'Unable to load apps' : 'No apps available'}
          </Text>
        </View>
      ),
      [error],
    );

    return (
      <FlatList
        data={apps}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          !apps.length ? styles.listContentEmpty : undefined,
        ]}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={emptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
      />
    );
  },
);

const OtherAppsScreen = () => {
  const navigation = useNavigation();
  const [apps, setApps] = useState<OtherAppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchApps = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(false);

    try {
      const nextApps = await globalSettingsService.getOtherApps();
      setApps(nextApps.filter(app => app.isActive));
    } catch {
      setError(true);
      setApps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchApps().catch(() => undefined);
    }, [fetchApps]),
  );

  const handleOpen = useCallback(async (app: OtherAppItem) => {
    if (app.comingSoon || !app.link) {
      return;
    }

    const canOpen = await Linking.canOpenURL(app.link);
    if (canOpen) {
      await Linking.openURL(app.link);
    }
  }, []);

  const handleRefresh = useCallback(
    () => {
      fetchApps(true).catch(() => undefined);
    },
    [fetchApps],
  );

  return (
    <View style={styles.screen}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient
        colors={[
          COLORS.backgroundGradientStart,
          COLORS.backgroundGradientMid,
          COLORS.backgroundGradientEnd,
        ]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        style={styles.absoluteFill}
      />
      <ImageBackground
        source={JUNGLE_BACKGROUND}
        resizeMode="cover"
        style={styles.absoluteFill}
        imageStyle={styles.backgroundImage}
      />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <AppBackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Other Apps</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <AppList
            apps={apps}
            error={error}
            refreshing={refreshing}
            onOpen={handleOpen}
            onRefresh={handleRefresh}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default OtherAppsScreen;
