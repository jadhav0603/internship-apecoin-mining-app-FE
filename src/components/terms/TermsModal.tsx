import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/FONTS';
import { COLORS } from '../../constants/COLORS';
import Loading from '../constant/Loading';
import SafeBlurView from '../constant/SafeBlurView';
import {
  TermsConditionsContent,
  TermsSection,
  globalSettingsService,
} from '../../services/globalSettingsService';
import styles from './TermsModal.style';


type TermsModalProps = {
  visible: boolean;
  accepting?: boolean;
  onAccept: () => void;
  onClose: () => void;
};

const ACCENT_START = COLORS.primaryDark;
const ACCENT_END = COLORS.primary;

const SectionCard = memo(({ section }: { section: TermsSection }) => (
  <Pressable
    style={({ pressed }) => [
      styles.sectionCard,
      pressed && styles.sectionCardPressed,
    ]}
  >
    <Text style={styles.sectionTitle}>{section.title}</Text>
    {section.content ? (
      <Text style={styles.sectionContent}>{section.content}</Text>
    ) : null}
    {section.points?.map(point => (
      <View key={point} style={styles.pointRow}>
        <View style={styles.bullet} />
        <Text style={styles.pointText}>{point}</Text>
      </View>
    ))}
  </Pressable>
));

const TermsIntro = memo(({ content }: { content: TermsConditionsContent }) => {
  const introHeading = content.intro?.heading;
  const introDescription = content.intro?.description;

  if (!introHeading && !introDescription) {
    return <View style={styles.listTopSpacer} />;
  }

  return (
    <View style={styles.introCard}>
      {introHeading ? (
        <Text style={styles.introHeading}>{introHeading}</Text>
      ) : null}
      {introDescription ? (
        <Text style={styles.introDescription}>{introDescription}</Text>
      ) : null}
    </View>
  );
});

const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  accepting = false,
  onAccept,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [content, setContent] = useState<TermsConditionsContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  const cardMaxHeight = Math.min(
    height - Math.max(insets.top + insets.bottom + 48, 96),
    760,
  );

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const terms = await globalSettingsService.getTermsConditions();
      setContent(terms);
      if (!terms) {
        setError('Terms are unavailable right now. Please try again shortly.');
      }
    } catch {
      setError('Terms are unavailable right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    opacityAnim.setValue(0);
    scaleAnim.setValue(0.94);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 17,
        stiffness: 190,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, scaleAnim, visible]);

  useEffect(() => {
    if (visible && !content) {
      void fetchTerms();
    }
  }, [content, fetchTerms, visible]);

  const sections = useMemo(() => content?.sections ?? [], [content?.sections]);

  const renderSection: ListRenderItem<TermsSection> = useCallback(
    ({ item }) => <SectionCard section={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: TermsSection, index: number) => `${item.title}-${index}`,
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeBlurView
          style={StyleSheet.absoluteFill as unknown as object}
          blurType="dark"
          blurAmount={22}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.9)"
        />
        <View style={styles.scrim} />

        <Animated.View
          style={[
            styles.cardShadow,
            {
              opacity: opacityAnim,
              height: cardMaxHeight,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              COLORS.ringGlow,
              COLORS.ringInactive,
              COLORS.ringGlowSoft,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.borderFrame}
          >
            <LinearGradient
              colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientMid, COLORS.backgroundGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.header}>
                <Text style={styles.title}>
                  {content?.title?.toUpperCase() ?? 'TERMS & CONDITIONS'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close terms and conditions"
                  hitSlop={12}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <Ionicons name="close" size={22} color="#ffffff" />
                </Pressable>
              </View>

              <LinearGradient
                colors={[
                  'transparent',
                  ACCENT_START,
                  ACCENT_END,
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.divider}
              />

              {loading ? (
                <View style={styles.stateContainer}>
                  <Loading size="medium" text="Loading terms..." />
                </View>
              ) : error ? (
                <View style={styles.stateContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable
                    onPress={fetchTerms}
                    style={({ pressed }) => [
                      styles.retryButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </Pressable>
                </View>
              ) : content ? (
                <FlatList
                  style={styles.list}
                  data={sections}
                  keyExtractor={keyExtractor}
                  renderItem={renderSection}
                  ListHeaderComponent={<TermsIntro content={content} />}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={4}
                  maxToRenderPerBatch={4}
                  windowSize={5}
                  removeClippedSubviews
                />
              ) : null}

              <View
                style={[
                  styles.footer,
                  { paddingBottom: Math.max(insets.bottom, 18) },
                ]}
              >
                <Pressable
                  disabled={!content || accepting}
                  onPress={onAccept}
                  style={({ pressed }) => [
                    styles.acceptButtonOuter,
                    (!content || accepting) && styles.acceptButtonDisabled,
                    pressed && !accepting && content && styles.buttonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[ACCENT_START, ACCENT_END]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.acceptButton}
                  >
                    {accepting ? (
                      <Loading size="small" text={null} />
                    ) : (
                      <Text style={styles.acceptButtonText}>
                        {content?.buttonText ?? ''}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default TermsModal;
