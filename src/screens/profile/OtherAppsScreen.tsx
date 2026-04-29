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

const JUNGLE_BACKGROUND = require('../../assets/images/drawer-bg2.webp');
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
        style={StyleSheet.absoluteFill}
      />
      <ImageBackground
        source={JUNGLE_BACKGROUND}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    opacity: 0.13,
  },
  topGlow: {
    position: 'absolute',
    top: -92,
    right: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(166,255,0,0.18)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -120,
    left: -82,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,198,255,0.14)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 74,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 22,
    lineHeight: 29,
    textAlign: 'center',
    letterSpacing: 0,
  },
  headerSpacer: {
    width: 42,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 34,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 14,
  },
  cardBorder: {
    borderRadius: 16,
    padding: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  card: {
    minHeight: 176,
    borderRadius: 15,
    padding: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(9,15,9,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardGlow: {
    position: 'absolute',
    top: -42,
    right: -34,
    width: 108,
    height: 108,
    borderRadius: 54,
    opacity: 0.16,
    shadowOpacity: 0.45,
    shadowRadius: 24,
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  iconFrame: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  iconFallback: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.black,
    fontSize: 25,
    lineHeight: 30,
  },
  lockDot: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3,7,4,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
  },
  name: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0,
    paddingRight: 8,
  },
  badge: {
    maxWidth: 112,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FONTS.semibold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0,
  },
  tagline: {
    color: '#AAAAAA',
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    marginTop: 2,
  },
  description: {
    color: '#888888',
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0,
    marginTop: 6,
  },
  buttonPressable: {
    marginTop: 18,
    borderRadius: 14,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  button: {
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 14,
    lineHeight: 18,
    marginLeft: 8,
    letterSpacing: 0,
  },
  buttonTextDisabled: {
    color: COLORS.textMuted,
  },
  emptyCard: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 26,
    backgroundColor: 'rgba(9,15,9,0.76)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 12,
    letterSpacing: 0,
  },
});

export default OtherAppsScreen;
