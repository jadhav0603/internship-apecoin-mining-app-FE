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

      showError(
        errorMessage,
        'Redeem Code',
      );
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
            <View style={{ width: 54, alignItems: 'flex-start' }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d08',
  },
  safeArea: {
    flex: 1,
  },
  primaryGlow: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(170, 255, 0, 0.09)',
    transform: [{ scaleX: 1.08 }],
  },
  secondaryGlow: {
    position: 'absolute',
    top: 360,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(170, 255, 0, 0.05)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  elevation: 10,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
  },
  headerSpacer: {
    width: 54,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 26,
  },
  giftHalo: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieIcon: {
    width: 320,
    height: 320,
    marginTop: -240,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: FONTS.black,
    fontWeight: '800',
    marginTop: -130,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
    fontFamily: FONTS.medium,
    fontWeight: '500',
    marginTop: 14,
  },
  highlightText: {
    color: '#B7FF31',
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(16, 22, 14, 0.78)',
  },
  statCardSpacing: {
    marginRight: 12,
  },
  statCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  statLabel: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: FONTS.black,
    fontWeight: '800',
  },
  statHint: {
    marginTop: 8,
    color: '#B7FF31',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 10,
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(16, 22, 14, 0.78)',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 14,
  },
  referralCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 10,
  },
  referralCodeText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginRight: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 6,
  },
  actionButtonPressed: {
    opacity: 0.88,
  },
  redeemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginRight: 10,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  claimButton: {
    height: 52,
    minWidth: 90,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B7FF31',
    shadowColor: '#B7FF31',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  claimButtonPressed: {
    opacity: 0.92,
  },
  claimButtonDisabled: {
    shadowOpacity: 0,
  },
  claimButtonText: {
    color: '#10140b',
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: FONTS.medium,
  },
});

export default ReferAndEarnScreen;
