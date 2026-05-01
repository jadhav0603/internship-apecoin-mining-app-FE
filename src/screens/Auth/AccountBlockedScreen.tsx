import React, { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/COLORS';
import { useAlert } from '../../context/AlertContext';
import { useUser } from '../../context/UserContext';
import { RootStackParamList } from '../../navigation/types';
import {
  clearBlockedAccount,
  useBlockedAccount,
} from '../../session/blockedAccountState';
import { authService } from '../../services/authService';
import styles from './AccountBlockedScreen.style';

const ALERT_PRESENTATION = {
  blurBackground: true,
  blurAmount: 18,
  theme: 'dark' as const,
  dismissOnBackdropPress: false,
};

type Props = NativeStackScreenProps<RootStackParamList, 'AccountBlocked'>;

const AccountBlockedScreen = ({ route, navigation }: Props) => {
  const { showError, showInfo } = useAlert();
  const { setUser } = useUser();
  const blockedAccount = useBlockedAccount();
  const [isClosing, setIsClosing] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const content = useMemo(() => {
    const type = blockedAccount?.type ?? route.params?.type ?? 'banned';
    const source = blockedAccount?.source ?? route.params?.source ?? 'login';
    const reason = blockedAccount?.reason ?? route.params?.reason ?? null;
    const isDeleted = type === 'deleted';
    const isDeleteSource = source === 'delete';
    const showClose = isDeleted || type === 'banned';

    return {
      type,
      source,
      reason,
      isDeleted,
      isDeleteSource,
      showClose,
      title: isDeleted ? 'Account Deleted' : 'Account Banned',
      subtitle: isDeleteSource
        ? 'Your account has been deleted.'
        : isDeleted
        ? 'Your account has been deleted.'
        : blockedAccount?.message ?? 'Your account has been banned.',
      accent: isDeleted ? '#6EF3C4' : '#FF6B6B',
      glow: isDeleted
        ? 'rgba(110, 243, 196, 0.18)'
        : 'rgba(255, 107, 107, 0.16)',
      iconName: isDeleted ? 'close-circle-outline' : 'ban-outline',
      showContact: source === 'login',
      showReactivate: source === 'login' && isDeleted,
    };
  }, [
    blockedAccount?.message,
    blockedAccount?.reason,
    blockedAccount?.source,
    blockedAccount?.type,
    route.params?.reason,
    route.params?.source,
    route.params?.type,
  ]);

  const handleClose = async () => {
    if (isClosing) {
      return;
    }

    try {
      setIsClosing(true);
      await authService.clearSession();
    } finally {
      clearBlockedAccount();
      setIsClosing(false);
    }
  };

  const handleRecoverAccount = async () => {
    if (isRecovering) {
      return;
    }

    try {
      setIsRecovering(true);
      const reactivationEmail =
        blockedAccount?.email ??
        authService.getCurrentUser()?.email ??
        null;

      if (!reactivationEmail) {
        throw new Error('Unable to determine which account to reactivate.');
      }

      const response = await authService.reactivateAccount(reactivationEmail);
      const currentUser = authService.getCurrentUser();
      const currentUserToken = currentUser
        ? await currentUser.getIdToken().catch(() => null)
        : null;

      if (!currentUser || !currentUserToken) {
        showInfo(
          'Account reactivated. Please login again.',
          'Account Reactivated',
          {
            ...ALERT_PRESENTATION,
            onConfirm: () => {
              void (async () => {
                setUser(null);
                await authService.clearSession();
                clearBlockedAccount();
              })();
            },
          },
        );
        return;
      }

      const syncedSession = await authService.syncCurrentSession({
        rollbackOnFailure: false,
      });

      if (!syncedSession?.user || syncedSession.user.status !== 'active') {
        showInfo(
          'Account reactivated. Please login again.',
          'Account Reactivated',
          {
            ...ALERT_PRESENTATION,
            onConfirm: () => {
              void (async () => {
                setUser(null);
                await authService.clearSession();
                clearBlockedAccount();
              })();
            },
          },
        );
        return;
      }

      setUser({
        uid: syncedSession.user.uid ?? response.user.uid ?? currentUser?.uid ?? '',
        email: syncedSession.user.email ?? response.user.email ?? currentUser?.email ?? '',
        displayName:
          syncedSession.user.displayName ??
          response.user.displayName ??
          currentUser?.displayName ??
          currentUser?.email?.split('@')[0] ??
          'User',
        photoURL:
          syncedSession.user.photoURL ??
          response.user.photoURL ??
          currentUser?.photoURL ??
          '',
        plan: syncedSession.user.plan ?? response.user.plan,
        referredBy:
          syncedSession.user.referredBy ??
          response.user.referredBy ??
          null,
        referralEarnings:
          syncedSession.user.referralEarnings ??
          response.user.referralEarnings ??
          0,
        referralCount:
          syncedSession.user.referralCount ??
          response.user.referralCount ??
          0,
      });
      showInfo(
        'Account reactivated. Now you can use your account.',
        'Account Reactivated',
        {
          ...ALERT_PRESENTATION,
          onConfirm: () => {
            clearBlockedAccount();
          },
        },
      );
    } catch (error: any) {
      showError(
        error?.response?.data?.message ??
          error?.message ??
          'Unable to recover account right now.',
        'Recover Account',
        ALERT_PRESENTATION,
      );
    } finally {
      setIsRecovering(false);
    }
  };

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
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundDeep}
      />
      <LinearGradient
        colors={['#040704', '#0B1209', '#111B10']}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={styles.backgroundFill}
      />
      <View style={[styles.topGlow, { backgroundColor: content.glow }]} />
      <View style={styles.gridAura} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          {content.showClose ? (
            <Pressable
              onPress={handleClose}
              disabled={isClosing}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
                isClosing && styles.closeButtonPressed,
              ]}
            >
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </Pressable>
          ) : null}

          <View style={[styles.iconShell, { shadowColor: content.accent }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
              style={styles.iconShellGradient}
            >
              <View
                style={[styles.iconCore, { backgroundColor: content.glow }]}
              >
                <Ionicons
                  name={content.iconName}
                  size={42}
                  color={content.accent}
                />
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.eyebrow}>Access Restricted</Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          {content.reason && !content.isDeleteSource ? (
            <View style={styles.reasonCard}>
              <Text style={styles.reasonLabel}>Reason</Text>
              <Text style={styles.reasonText}>{content.reason}</Text>
            </View>
          ) : null}

          {content.showContact || content.showReactivate ? (
            <View style={styles.actionStack}>
              {content.showContact ? (
                <Pressable
                  onPress={() =>
                    // openMailClient(
                    //   content.isDeleted
                    //     ? 'Recover my deleted ApeCoin account'
                    //     : 'Review my banned ApeCoin account',
                    //   'No mail app is available right now. Please contact support from your registered email account.',
                    // )
                    navigation.navigate('ReportIssue')
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
                      <Ionicons
                        name="mail-open-outline"
                        size={18}
                        color={COLORS.textDark}
                      />
                      <Text style={styles.primaryActionText}>Report Issue</Text>
                    </LinearGradient>
                  )}
                </Pressable>
              ) : null}

              {content.showReactivate ? (
                <Pressable
                  onPress={handleRecoverAccount}
                  disabled={isRecovering}
                  style={styles.secondaryAction}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.secondaryActionInner,
                        (pressed || isRecovering) &&
                          styles.secondaryActionInnerPressed,
                      ]}
                    >
                      <Ionicons
                        name="refresh-circle-outline"
                        size={18}
                        color={COLORS.textPrimary}
                      />
                      <Text style={styles.secondaryActionText}>
                        {isRecovering ? 'Recovering...' : 'Recover Account'}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.helperText}>
            {content.isDeleteSource
              ? 'Close this screen to finish signing out of this account.'
              : 'Login is disabled while this account remains restricted.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountBlockedScreen;
