import React, { ReactNode, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import AppBackButton from '../../components/navigation/AppBackButton';
import {
  AboutSocialLink,
  AboutTextSection,
  AboutUsContent,
  globalSettingsService,
} from '../../services/globalSettingsService';

const MONKEY_IMG = require('../../assets/images/auth_bg.webp');

// ─── helpers ────────────────────────────────────────────────────────────────
const hasText = (value?: string) => Boolean(value?.trim());

const hasSectionContent = (section?: AboutTextSection) =>
  Boolean(hasText(section?.title) || hasText(section?.description));

const hasAboutContent = (content: AboutUsContent | null) =>
  Boolean(
    content &&
      (hasText(content.pageTitle) ||
        hasSectionContent(content.aboutCard) ||
        hasSectionContent(content.mining) ||
        hasSectionContent(content.dailyRewards) ||
        hasSectionContent(content.referral) ||
        hasSectionContent(content.appWorking) ||
        content.social?.links?.length),
  );

const openUrl = async (url?: string) => {
  if (!url) return;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) await Linking.openURL(url);
};

// ─── sub-components ─────────────────────────────────────────────────────────

/**
 * Renders a card with an optional inline-highlighted value.
 * If the description contains '{{value}}', it replaces it with the highlightValue.
 * Otherwise, it appends the highlightValue at the end.
 */
type InfoCardProps = {
  section?: AboutTextSection;
  highlightValue?: string;
  /** Icon name from Ionicons to show next to the card title */
  icon?: string;
  children?: ReactNode;
};

const InfoCard = ({
  section,
  highlightValue,
  icon,
  children,
}: InfoCardProps) => {
  if (!hasSectionContent(section) && !children) return null;

  const renderDescription = () => {
    const description = section?.description;
    if (!hasText(description)) return null;

    if (highlightValue && description?.includes('{{value}}')) {
      const parts = description.split('{{value}}');
      return (
        <Text style={styles.cardDescription}>
          {parts[0]}
          <Text style={styles.inlineHighlight}>{highlightValue}</Text>
          {parts[1]}
        </Text>
      );
    }

    return (
      <Text style={styles.cardDescription}>
        {description}
        {highlightValue ? (
          <>
            {'  '}
            <Text style={styles.inlineHighlight}>{highlightValue}</Text>
          </>
        ) : null}
      </Text>
    );
  };

  return (
    <View style={styles.card}>
      {/* Title row */}
      {hasText(section?.title) ? (
        <View style={styles.cardTitleRow}>
          {icon ? (
            <View style={styles.cardIconBadge}>
              <Ionicons name={icon} size={16} color={COLORS.primary} />
            </View>
          ) : null}
          <Text style={styles.cardTitle}>{section?.title}</Text>
        </View>
      ) : null}

      {/* Description with optional inline highlight */}
      {renderDescription()}

      {children}
    </View>
  );
};

/** Social icon button with label underneath */
const SocialButton = ({ link }: { link: AboutSocialLink }) => (
  <TouchableOpacity
    style={styles.socialButton}
    activeOpacity={0.7}
    onPress={() => void openUrl(link.url)}
  >
    <View style={styles.socialIconContainer}>
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)']}
        style={styles.socialIconGlass}
      >
        <Ionicons name={link.icon as any} size={26} color={COLORS.primary} />
      </LinearGradient>
    </View>
    {hasText(link.label) ? (
      <Text style={styles.socialLabel}>{link.label}</Text>
    ) : null}
  </TouchableOpacity>
);

// ─── screen ─────────────────────────────────────────────────────────────────

const AboutUsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [aboutUs, setAboutUs] = useState<AboutUsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchAboutUs = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(false);
    try {
      const content = await globalSettingsService.getAboutUs();
      setAboutUs(content);
    } catch {
      setError(true);
      setAboutUs(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchAboutUs();
    }, [fetchAboutUs]),
  );

  const showEmptyState = !loading && !error && !hasAboutContent(aboutUs);
  const socialLinks = aboutUs?.social?.links ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[
          COLORS.backgroundGradientStart,
          COLORS.backgroundGradientMid,
          COLORS.backgroundGradientEnd,
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <AppBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {aboutUs?.pageTitle ?? 'About Us'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void fetchAboutUs(true)}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ── Monkey Avatar ── */}
          <View style={styles.avatarWrapper}>
            <Image
              source={
                aboutUs?.headerImageUrl &&
                aboutUs.headerImageUrl !== 'DEFAULT_MONKEY'
                  ? { uri: aboutUs.headerImageUrl }
                  : MONKEY_IMG
              }
              style={styles.avatar}
              resizeMode="cover"
            />
            {/* <LinearGradient
              colors={['transparent', '#1c2a0aff']}
              style={styles.avatarFade}
            /> */}
          </View>

          {/* ── Error / Empty State ── */}
          {error || showEmptyState ? (
            <View style={styles.stateCard}>
              <Ionicons
                name={
                  error ? 'alert-circle-outline' : 'information-circle-outline'
                }
                size={36}
                color={COLORS.primary}
              />
              <Text style={styles.stateText}>
                {error
                  ? 'Could not load content. Pull down to retry.'
                  : 'No information available yet.'}
              </Text>
            </View>
          ) : (
            <>
              {/* ── About Card ── */}
              <InfoCard
                section={aboutUs?.aboutCard}
                icon="information-circle-outline"
              />

              {/* ── Mining ── */}
              <InfoCard section={aboutUs?.mining} icon="flash-outline" />

              {/* ── Daily Rewards — description only, no value grid ── */}
              <InfoCard section={aboutUs?.dailyRewards} icon="gift-outline" />

              {/* ── Referral — displayValue highlighted inline ── */}
              <InfoCard
                section={aboutUs?.referral}
                icon="people-outline"
                highlightValue={
                  hasText(aboutUs?.referral?.displayValue)
                    ? aboutUs?.referral?.displayValue
                    : undefined
                }
              />

              {/* ── How the App Works ── */}
              <InfoCard section={aboutUs?.appWorking} icon="bulb-outline" />

              {/* ── Connect With Us ── */}
              {socialLinks.length ? (
                <View style={styles.socialCard}>
                  {hasText(aboutUs?.social?.title) ? (
                    <View style={styles.cardTitleRow}>
                      <View style={styles.cardIconBadge}>
                        <Ionicons
                          name="share-social-outline"
                          size={16}
                          color={COLORS.primary}
                        />
                      </View>
                      <Text style={styles.cardTitle}>
                        {aboutUs?.social?.title}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.socialRow}>
                    {socialLinks.map(link => (
                      <SocialButton
                        link={link}
                        key={`${link.label}-${link.url}`}
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
    letterSpacing: 0.3,
  },
  headerSpacer: { width: 42 },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 40,
  },

  // ── States ──
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCard: {
    minHeight: 130,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  stateText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Cards ──
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },

  // ── Card title ──
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(166,255,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(166,255,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 1,
  },

  // ── Card body ──
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 23,
    letterSpacing: 0.1,
  },

  // ── Inline highlighted value ──
  inlineHighlight: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // ── Social ──
  socialCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16, // slightly reduced gap to help them fit
    marginTop: 10,
    width: '100%',
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: 70,
  },
  socialIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 1, // for border effect
    overflow: 'hidden',
  },
  socialIconGlass: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 17,
  },
  socialLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  // ── Avatar ──
  avatarWrapper: {
    alignSelf: 'center',
    width: 140,
    height: 180,
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});

export default AboutUsScreen;
