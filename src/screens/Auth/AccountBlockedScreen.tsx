import React, { useMemo } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/COLORS';
import { useAlert } from '../../context/AlertContext';
import { useBlockedAccount } from '../../session/blockedAccountState';

const ALERT_PRESENTATION = {
  blurBackground: true,
  blurAmount: 18,
  theme: 'dark' as const,
};

const AccountBlockedScreen = () => {
  const { showError, showInfo } = useAlert();
  const blockedAccount = useBlockedAccount();

  const content = useMemo(() => {
    const isDeleted = blockedAccount?.status === 'DELETED';

    return {
      isDeleted,
      title: isDeleted ? 'Account Deleted' : 'Account Banned',
      subtitle: isDeleted
        ? 'Your ApeCoin account is unavailable right now. If this happened by mistake, our team can review recovery options with you.'
        : 'This ApeCoin account has been restricted. Contact support if you believe the restriction was applied in error.',
      accent: isDeleted ? '#6EF3C4' : '#FF6B6B',
      glow: isDeleted ? 'rgba(110, 243, 196, 0.18)' : 'rgba(255, 107, 107, 0.16)',
      iconName: isDeleted ? 'archive-outline' : 'ban-outline',
    };
  }, [blockedAccount?.status]);

  const openMailClient = async (subject: string, emptyStateMessage: string) => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);

      if (!supported) {
        showInfo(emptyStateMessage, 'Contact Support', ALERT_PRESENTATION);
        return;
      }

      await Linking.openURL(mailtoUrl);
    } catch {
      showError(
        'We could not open your mail app right now. Please try again shortly.',
        'Contact Support',
        ALERT_PRESENTATION,
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDeep} />
      <LinearGradient
        colors={['#040704', '#0B1209', '#111B10']}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.topGlow, { backgroundColor: content.glow }]} />
      <View style={styles.gridAura} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={[styles.iconShell, { shadowColor: content.accent }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
              style={styles.iconShellGradient}
            >
              <View style={[styles.iconCore, { backgroundColor: content.glow }]}>
                <Ionicons name={content.iconName} size={42} color={content.accent} />
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.eyebrow}>Access Restricted</Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          {blockedAccount?.reason ? (
            <View style={styles.reasonCard}>
              <Text style={styles.reasonLabel}>Reason</Text>
              <Text style={styles.reasonText}>{blockedAccount.reason}</Text>
            </View>
          ) : null}

          <View style={styles.actionStack}>
            <Pressable
              onPress={() =>
                openMailClient(
                  content.isDeleted
                    ? 'Recover my deleted ApeCoin account'
                    : 'Review my banned ApeCoin account',
                  'No mail app is available right now. Please contact support from your registered email account.',
                )
              }
              style={styles.primaryAction}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={
                    pressed
                      ? ['#90D900', '#6FB300']
                      : [COLORS.primary, COLORS.primaryDark]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryActionGradient}
                >
                  <Ionicons name="mail-open-outline" size={18} color={COLORS.textDark} />
                  <Text style={styles.primaryActionText}>Contact Support</Text>
                </LinearGradient>
              )}
            </Pressable>

            {content.isDeleted ? (
              <Pressable
                onPress={() =>
                  openMailClient(
                    'Recover my ApeCoin account',
                    'Account recovery requests can be sent from your registered email account.',
                  )
                }
                style={styles.secondaryAction}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.secondaryActionInner,
                      pressed && styles.secondaryActionInnerPressed,
                    ]}
                  >
                    <Ionicons
                      name="refresh-circle-outline"
                      size={18}
                      color={COLORS.textPrimary}
                    />
                    <Text style={styles.secondaryActionText}>Recover Account</Text>
                  </View>
                )}
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.helperText}>
            Login is disabled while this account remains restricted.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDeep,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.85,
  },
  gridAura: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  heroCard: {
    backgroundColor: 'rgba(8, 14, 8, 0.82)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
  },
  iconShell: {
    alignSelf: 'center',
    width: 104,
    height: 104,
    borderRadius: 52,
    marginBottom: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  iconShellGradient: {
    flex: 1,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 22,
  },
  reasonCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    marginBottom: 20,
  },
  reasonLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  reasonText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  actionStack: {
    gap: 12,
  },
  primaryAction: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryActionText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryAction: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  secondaryActionInner: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryActionInnerPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  secondaryActionText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  helperText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
  },
});

export default AccountBlockedScreen;
