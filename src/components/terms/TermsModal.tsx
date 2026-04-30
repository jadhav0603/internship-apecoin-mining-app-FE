import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
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
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/FONTS';
import { COLORS } from '../../constants/COLORS';
import {
  TermsConditionsContent,
  TermsSection,
  globalSettingsService,
} from '../../services/globalSettingsService';

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
        <BlurView
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
                  <ActivityIndicator color={ACCENT_END} size="large" />
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
                      <ActivityIndicator color="#120900" size="small" />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(10, 5, 0, 0.44)',
  },
  cardShadow: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 20,
    shadowColor: ACCENT_START,
    shadowOpacity: 0.34,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 22,
  },
  borderFrame: {
    flex: 1,
    borderRadius: 20,
    padding: 1.2,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  header: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 12,
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontFamily: FONTS.black,
    fontSize: 18,
    letterSpacing: 0,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  closeButtonPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: COLORS.glass,
  },
  divider: {
    height: 2,
    marginHorizontal: 22,
    borderRadius: 999,
    shadowColor: ACCENT_END,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  list: {
    flex: 1,
  },
  listTopSpacer: {
    height: 2,
  },
  introCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  introHeading: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 7,
  },
  introDescription: {
    color: '#aaa',
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionCardPressed: {
    borderColor: COLORS.activeBorder,
    shadowColor: ACCENT_START,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    transform: [{ scale: 0.99 }],
  },
  sectionTitle: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
  sectionContent: {
    color: '#aaa',
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 21,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT_END,
    marginTop: 7,
    marginRight: 10,
    shadowColor: ACCENT_END,
    shadowOpacity: 0.75,
    shadowRadius: 5,
  },
  pointText: {
    flex: 1,
    color: '#aaa',
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 21,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#d4d4d4',
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 116,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.activeBorder,
    backgroundColor: COLORS.glass,
  },
  retryText: {
    color: ACCENT_END,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: COLORS.cardStrong,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  acceptButtonOuter: {
    borderRadius: 999,
    shadowColor: ACCENT_START,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  acceptButtonDisabled: {
    opacity: 0.56,
  },
  acceptButton: {
    minHeight: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: COLORS.textDark,
    fontFamily: FONTS.black,
    fontSize: 15,
    letterSpacing: 0,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
});

export default TermsModal;
