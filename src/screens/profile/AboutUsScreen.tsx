import React, { ReactNode, useCallback, useState } from 'react';
import {
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
import Loading from '../../components/constant/Loading';
import styles from './AboutUsScreen.style';
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
        style={styles.backgroundFill}
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
        <Loading fullScreen size="medium" text="Loading about us..." />
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

export default AboutUsScreen;
