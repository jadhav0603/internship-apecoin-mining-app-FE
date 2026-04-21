import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONTS } from '../../constants/FONTS';
import { getUserDisplayName, useUser } from '../../context/UserContext';
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

const ReferAndEarnScreen = () => {
  const navigation = useNavigation<ReferAndEarnNavigationProp>();
  const route = useRoute<ReferAndEarnRouteProp>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [redeemCode, setRedeemCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    referredBy,
    referralEarnings,
    referralCount,
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
    [resolvedEmail, resolvedUsername]
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  const handleCopy = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied', 'Referral code copied to clipboard.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on ApeCoin and use my referral code: ${referralCode}`,
      });
    } catch {
      Alert.alert('Share', 'Unable to open the share sheet right now.');
    }
  };

  const handleClaim = async () => {
    const referralEmail = redeemCode.trim().toLowerCase();

    if (!referralEmail) {
      Alert.alert('Redeem Code', 'Please enter a referral email first.');
      return;
    }

    if (!resolvedEmail) {
      Alert.alert('Redeem Code', 'Unable to resolve your account email right now.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await referralService.applyReferral({
        email: resolvedEmail,
        referralEmail,
        source: 'profile',
      });

      setRedeemCode('');
      refresh();

      Alert.alert(
        'Referral Applied',
        response.referralRewardApplied
          ? `Referral linked successfully. ${response.reward.toFixed(2)} APE was credited from current earnings.`
          : 'Referral linked successfully. Future mining and reward activity will credit the referrer automatically.'
      );
    } catch (error: any) {
      Alert.alert(
        'Redeem Code',
        error?.response?.data?.message || 'Unable to apply the referral right now.'
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
        <View style={styles.primaryGlow} />
        <View style={styles.secondaryGlow} />

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
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
            </Pressable>

            <Text style={styles.headerTitle}>Refer &amp; Earn</Text>

            <Pressable
              onPress={() => Alert.alert('Settings', 'Referral settings coming soon.')}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.heroSection}>
            <View style={styles.giftHalo}>
              <View style={styles.giftCircle}>
                <MaterialCommunityIcons name="gift-outline" size={56} color="#B7FF31" />
              </View>
            </View>

            <Text style={styles.heroTitle}>Invite &amp; Earn Rewards!</Text>
            <Text style={styles.heroSubtitle}>
              Share your code with friends and earn{'\n'}
              <Text style={styles.highlightText}>{referralPercentage}% rewards</Text> for every
              successful invite
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardSpacing]}>
              <Text style={styles.statLabel}>Referral Earnings</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#B7FF31" />
              ) : (
                <Text style={styles.statValue}>{referralEarnings.toFixed(2)} APE</Text>
              )}
            </View>

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
                  <Ionicons name="share-social-outline" size={21} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>REDEEM REFERRAL EMAIL</Text>

            <View style={styles.redeemRow}>
              <TextInput
                style={[
                  styles.input,
                  hasAppliedReferral && styles.inputDisabled,
                ]}
                placeholder={
                  hasAppliedReferral ? 'Referral already applied' : 'Enter referral email'
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
                  (pressed || hasAppliedReferral || submitting) && styles.claimButtonPressed,
                  (hasAppliedReferral || submitting) && styles.claimButtonDisabled,
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

            <Text style={styles.helperText}>
              {hasAppliedReferral
                ? `This account is linked to ${referredBy}.`
                : 'You can link your account to one referrer once. Rewards are calculated by the backend.'}
            </Text>
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
  },
  iconButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconButtonPressed: {
    opacity: 0.9,
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
    width: 156,
    height: 156,
    borderRadius: 78,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B7FF31',
    shadowOpacity: 0.32,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  giftCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(183,255,49,0.42)',
    backgroundColor: 'rgba(183,255,49,0.06)',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: FONTS.black,
    fontWeight: '800',
    marginTop: 26,
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
  card: {
    marginBottom: 22,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(16, 22, 14, 0.78)',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 18,
  },
  referralCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 14,
  },
  referralCodeText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginRight: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 52,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 8,
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
    height: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    paddingHorizontal: 22,
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginRight: 14,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  claimButton: {
    height: 62,
    minWidth: 108,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B7FF31',
    shadowColor: '#B7FF31',
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  claimButtonPressed: {
    opacity: 0.92,
  },
  claimButtonDisabled: {
    shadowOpacity: 0,
  },
  claimButtonText: {
    color: '#10140b',
    fontSize: 17,
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
