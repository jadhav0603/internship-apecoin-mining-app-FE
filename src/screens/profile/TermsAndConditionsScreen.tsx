import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useNavigation,
} from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppBackButton from '../../components/navigation/AppBackButton';
import Loading from '../../components/constant/Loading';
import { globalSettingsService } from '../../services/globalSettingsService';
import { userService } from '../../services/userService';
import { useUser } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import type { RootStackParamList } from '../../navigation/types';
import styles from './TermsAndConditionsScreen.style';

const TermsAndConditionsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, setUser } = useUser();
  const { showError } = useAlert();
  const [content, setContent] = useState<
    Awaited<ReturnType<typeof globalSettingsService.getTermsConditions>>
  >(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [checked, setChecked] = useState(false);

  const isMandatory = user?.termsAccepted !== true;
  const canGoBack = navigation.canGoBack() && !isMandatory;
  const canContinue = Boolean(content) && checked && !accepting;

  const fetchTerms = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const terms = await globalSettingsService.getTermsConditions();
      setContent(terms);

      if (!terms) {
        showError(
          'Terms & Conditions are unavailable right now. Please try again shortly.',
          'Terms Unavailable',
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.log('[terms] failed to load terms content:', error);
      }

      showError(
        'Terms & Conditions are unavailable right now. Please try again shortly.',
        'Terms Unavailable',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    void fetchTerms(true);
  }, [fetchTerms]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    await fetchTerms(false);
  }, [fetchTerms, refreshing]);

  const handleAccept = async () => {
    if (accepting || !canContinue) {
      return;
    }

    try {
      setAccepting(true);
      const response = await userService.acceptTerms();
      console.log('Terms accepted response:', response);

      if (!response.success) {
        throw new Error('Terms acceptance was not completed.');
      }

      setUser(prev =>
        prev
          ? {
              ...prev,
              ...response,
              termsAccepted: true,
              acceptedTerms: true,
            }
          : prev,
      );
      navigation.replace('MainTabs');
    } catch (error: any) {
      if (__DEV__) {
        console.log('[terms] failed to accept terms:', error);
      }

      showError(
        error?.response?.data?.message ||
          'Unable to accept Terms & Conditions right now.',
        'Acceptance Failed',
      );
    } finally {
      setAccepting(false);
    }
  };

  const buttonLabel = useMemo(() => {
    if (!content?.buttonText) {
      return 'Continue';
    }

    return content.buttonText;
  }, [content?.buttonText]);

  return (
    <LinearGradient
      colors={['#07160D', '#0B2313', '#040B07']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        <View style={styles.header}>
          {canGoBack ? (
            <AppBackButton onPress={() => navigation.goBack()} />
          ) : (
            <View style={styles.headerSpacer} />
          )}
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingState}>
              <Loading size="medium" text="Loading terms..." />
            </View>
          ) : content ? (
            <>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => void handleRefresh()}
                    tintColor="#9AFB65"
                  />
                }
              >
                <Text style={styles.title}>
                  {content?.title ?? 'Terms & Conditions'}
                </Text>

                {content?.intro?.heading ? (
                  <Text style={styles.introHeading}>{content.intro.heading}</Text>
                ) : null}

                {content?.intro?.description ? (
                  <Text style={styles.introDescription}>
                    {content.intro.description}
                  </Text>
                ) : null}

                {(content?.sections ?? []).map((section, index) => (
                  <View
                    key={`${section.title}-${index}`}
                    style={styles.sectionCard}
                  >
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {section.content ? (
                      <Text style={styles.sectionContent}>{section.content}</Text>
                    ) : null}
                    {section.points?.map(point => (
                      <View key={point} style={styles.pointRow}>
                        <View style={styles.pointBullet} />
                        <Text style={styles.pointText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>

              {isMandatory ? (
                <View style={styles.footer}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    onPress={() => setChecked(prev => !prev)}
                    style={({ pressed }) => [
                      styles.checkboxRow,
                      pressed && styles.checkboxRowPressed,
                    ]}
                  >
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={checked ? '#9AFB65' : 'rgba(255,255,255,0.72)'}
                    />
                    <Text style={styles.checkboxLabel}>
                      I agree to Terms & Conditions
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={!canContinue}
                    onPress={handleAccept}
                    style={({ pressed }) => [
                      styles.buttonOuter,
                      !canContinue && styles.buttonDisabled,
                      pressed &&
                        canContinue &&
                        styles.buttonOuterPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={['#7CE85B', '#2A8A2A']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.buttonInner}
                    >
                      {accepting ? (
                        <Loading size="small" text={null} />
                      ) : (
                        <Text style={styles.buttonText}>{buttonLabel}</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.errorState}>
              <Text style={styles.errorTitle}>Terms unavailable</Text>
              <Text style={styles.errorText}>
                We could not load the latest Terms & Conditions. Please try
                again.
              </Text>
              <Pressable
                onPress={() => void fetchTerms(true)}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.buttonOuterPressed,
                ]}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TermsAndConditionsScreen;
