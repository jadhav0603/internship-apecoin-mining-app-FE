import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import AppBackButton from '../../components/navigation/AppBackButton';
import { FONTS } from '../../constants/FONTS';
import { getUserDisplayName, useUser } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import { useWallet } from '../../context/WalletContext';
import { useReferralData } from '../../hooks/useReferralData';
import { RootStackParamList } from '../../navigation/types';
import { referralService } from '../../services/referralService';
import styles from './ReferAndEarnScreen.style';

type ReferAndEarnRouteProp = RouteProp<RootStackParamList, 'ReferAndEarn'>;
type ReferAndEarnNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReferAndEarn'
>;

const buildReferralCode = (email?: string, username?: string) => {
  const trimmedEmail = email?.trim();
  if (trimmedEmail) {
    return trimmedEmail.toLowerCase();
  }

  const normalizedName =
    username
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '') || 'ape.user';

  return `${normalizedName}@apecoin.app`;
};

const ALERT_PRESENTATION = {
  blurBackground: true,
  blurAmount: 18,
  theme: 'dark' as const,
};

const isCircularReferralMessage = (message?: string) =>
  typeof message === 'string' &&
  message.toLowerCase().includes('circular referrals are not allowed');

const isSelfReferralMessage = (message?: string) =>
  typeof message === 'string' &&
  message.toLowerCase().includes('own email as a referral');

const ReferAndEarnScreen = () => {
  const navigation = useNavigation<ReferAndEarnNavigationProp>();
  const route = useRoute<ReferAndEarnRouteProp>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { showError, showSuccess } = useAlert();
  const { refreshBalance } = useWallet();
  const [redeemCode, setRedeemCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    referredBy,
    referralEarnings,
    referralCount,
    referralHistory,
    referralPercentage,
    loading,
    refresh,
  } = useReferralData();

  const fallbackUsername = getUserDisplayName(user);
  const resolvedEmail = route.params?.email || user?.email;
  const resolvedUsername = route.params?.username || fallbackUsername;
  const hasAppliedReferral = Boolean(referredBy);

  const referralCode = useMemo(
    () => buildReferralCode(resolvedEmail, resolvedUsername),
    [resolvedEmail, resolvedUsername],
  );

  const totalReferralEarnings = useMemo(() => {
    const historyTotal = referralHistory.reduce(
      (sum, item) => sum + (Number(item.reward) || 0),
      0,
    );

    return historyTotal > 0 ? historyTotal : referralEarnings;
  }, [referralEarnings, referralHistory]);

  // const handleBack = () => {
  //   if (navigation.canGoBack()) {
  //     navigation.goBack();
  //     return;
  //   }

  //   navigation.navigate('MainTabs', {screen: 'Profile'});
  // };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCopy = () => {
    Clipboard.setString(referralCode);
    showSuccess('Referral code copied to clipboard.', 'Copied');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on ApeCoin and use my referral code: ${referralCode}`,
      });
    } catch {
      showError('Unable to open the share sheet right now.', 'Share');
    }
  };

  const showReferralRuleError = (message: string, title: string) => {
    showError(message, title, {
      ...ALERT_PRESENTATION,
      dedupeKey: 'referral-rule-error',
    });
  };

  const handleClaim = async () => {
    const referralEmail = redeemCode.trim().toLowerCase();
    const currentUserEmail = resolvedEmail?.trim().toLowerCase();

    if (!referralEmail) {
      showError('Please enter a referral email first.', 'Redeem Code');
      return;
    }

    if (!currentUserEmail) {
      showError(
        'Unable to resolve your account email right now.',
        'Redeem Code',
      );
      return;
    }

    if (referralEmail === currentUserEmail) {
      showReferralRuleError(
        'You cannot use your own email as a referral code. Please enter the email of the person who invited you.',
        'Invalid Referral',
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await referralService.applyReferral({
        email: currentUserEmail,
        referralEmail,
        source: 'profile',
      });

      setRedeemCode('');
      refresh();
      if (response.referralRewardApplied) {
        await refreshBalance();
      }

      showSuccess(
        response.referralRewardApplied
          ? `Referral linked successfully. ${response.reward.toFixed(
              2,
            )} APE was credited from current earnings.`
          : 'Referral linked successfully. Future mining and reward activity will credit the referrer automatically.',
        'Referral Applied',
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Unable to apply the referral right now.';

      if (isCircularReferralMessage(errorMessage)) {
        showReferralRuleError(
          'Circular referrals are not allowed between two accounts. This user is already connected to your account as your invitee.',
          'Circular Referral Blocked',
        );
        return;
      }

      if (isSelfReferralMessage(errorMessage)) {
        showReferralRuleError(
          'You cannot use your own email as a referral code. Please enter the email of the person who invited you.',
          'Invalid Referral',
        );
        return;
      }

      showError(errorMessage, 'Redeem Code');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#11170d', '#090d08', '#050704']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      <StatusBar backgroundColor="#10150c" barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <View style={styles.backButtonWrap}>
              <AppBackButton
                onPress={handleBack}
                iconSize={22}
                style={styles.iconButton}
              />
            </View>

            {/* <AppBackButton onPress={onBack} /> */}

            <Text style={styles.headerTitle}>Refer &amp; Earn</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.giftHalo} pointerEvents="none">
              <LottieView
                source={require('../../assets/animations/reward_first_page_animation.json')}
                autoPlay
                loop
                style={styles.lottieIcon}
              />
            </View>

            <Text style={styles.heroTitle}>Invite &amp; Earn Rewards!</Text>
            <Text style={styles.heroSubtitle}>
              Share your code with friends and earn{'\n'}
              <Text style={styles.highlightText}>
                {referralPercentage}% rewards
              </Text>{' '}
              for every successful invite
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Pressable
              onPress={() => navigation.navigate('TransactionHistory')}
              style={({ pressed }) => [
                styles.statCard,
                styles.statCardSpacing,
                pressed && styles.statCardPressed,
              ]}
            >
              <Text style={styles.statLabel}>Referral Earnings</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#B7FF31" />
              ) : (
                <>
                  <Text style={styles.statValue}>
                    {totalReferralEarnings.toFixed(4)} APE
                  </Text>
                  <Text style={styles.statHint}>Open transaction history</Text>
                </>
              )}
            </Pressable>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Successful Referrals</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#B7FF31" />
              ) : (
                <Text style={styles.statValue}>{referralCount}</Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>YOUR REFERRAL CODE</Text>

            <View style={styles.referralCodeRow}>
              <Text style={styles.referralCodeText} numberOfLines={1}>
                {referralCode}
              </Text>

              <View style={styles.actionButtonsRow}>
                <Pressable
                  onPress={handleCopy}
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Ionicons name="copy-outline" size={21} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  onPress={handleShare}
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={21}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.card}>
            <Text style={styles.cardLabel}>REDEEM REFERRAL EMAIL</Text>

            <View style={styles.redeemRow}>
              <TextInput
                style={[
                  styles.input,
                  hasAppliedReferral && styles.inputDisabled,
                ]}
                placeholder={
                  hasAppliedReferral
                    ? 'Referral already applied'
                    : 'Enter referral email'
                }
                placeholderTextColor="rgba(255,255,255,0.32)"
                value={hasAppliedReferral ? referredBy ?? '' : redeemCode}
                onChangeText={setRedeemCode}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!hasAppliedReferral && !submitting}
              />

              <Pressable
                onPress={() => {
                  handleClaim().catch(() => undefined);
                }}
                disabled={hasAppliedReferral || submitting}
                style={({ pressed }) => [
                  styles.claimButton,
                  (pressed || hasAppliedReferral || submitting) &&
                    styles.claimButtonPressed,
                  (hasAppliedReferral || submitting) &&
                    styles.claimButtonDisabled,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#10140b" />
                ) : (
                  <Text style={styles.claimButtonText}>
                    {hasAppliedReferral ? 'Applied' : 'Claim'}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* <Text style={styles.helperText}>
              {hasAppliedReferral
                ? `This account is linked to ${referredBy}.`
                : 'You can link your account to one referrer once. Rewards are calculated by the backend.'}
            </Text> */}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ReferAndEarnScreen;
