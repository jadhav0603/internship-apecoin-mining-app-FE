import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import type { AlertType } from '../../context/AlertContext';
import SafeBlurView from './SafeBlurView';
import styles from './CustomAlert.style';


type AlertTheme = 'light' | 'dark';

export type CustomAlertButton = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export type CustomAlertPresentationOptions = {
  blurBackground?: boolean;
  blurAmount?: number;
  dismissOnBackdropPress?: boolean;
  theme?: AlertTheme | 'system';
};

type CustomAlertProps = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons: CustomAlertButton[];
  presentation?: CustomAlertPresentationOptions;
  onRequestClose?: () => void;
  onHidden?: () => void;
};

type AlertPalette = {
  backdrop: string;
  blurType: 'light' | 'dark';
  blurFallback: string;
  cardBackground: string;
  borderBase: string;
  title: string;
  message: string;
  secondaryBorder: string;
  secondaryText: string;
  primaryText: string;
  shadowColor: string;
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  buttons,
  presentation,
  onRequestClose,
  onHidden,
}) => {
  const systemScheme = useColorScheme();
  const [isMounted, setIsMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const resolvedTheme = resolveTheme(presentation?.theme, systemScheme);
  const palette = getAlertPalette(resolvedTheme);
  const accentColor = getAccentColor(type);
  const iconName = getIconName(type);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      backdropOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(0.8);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          damping: 16,
          stiffness: 220,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    if (!isMounted) {
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.8,
        duration: 170,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
        onHidden?.();
      }
    });
  }, [backdropOpacity, cardOpacity, cardScale, isMounted, onHidden, visible]);

  const cardStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: palette.cardBackground,
        borderColor: withOpacity(
          accentColor,
          resolvedTheme === 'dark' ? 0.32 : 0.2,
        ),
        opacity: cardOpacity,
        shadowColor: palette.shadowColor,
        transform: [{ scale: cardScale }],
      },
    ],
    [accentColor, cardOpacity, cardScale, palette, resolvedTheme],
  );

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isMounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
            backgroundColor: palette.backdrop,
          },
        ]}
      >
        {presentation?.blurBackground ? (
          <SafeBlurView
            style={StyleSheet.absoluteFill as unknown as object}
            blurType={palette.blurType}
            blurAmount={presentation.blurAmount ?? 12}
            reducedTransparencyFallbackColor={palette.blurFallback}
          />
        ) : null}

        <Pressable
          style={StyleSheet.absoluteFill}
          disabled={!onRequestClose}
          onPress={onRequestClose}
        />

        <Animated.View style={cardStyle}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: withOpacity(
                  accentColor,
                  resolvedTheme === 'dark' ? 0.14 : 0.12,
                ),
              },
            ]}
          >
            <Ionicons name={iconName} size={34} color={accentColor} />
          </View>

          <Text style={[styles.title, { color: palette.title }]}>{title}</Text>
          <Text style={[styles.message, { color: palette.message }]}>
            {message}
          </Text>

          <View style={styles.buttonsContainer}>
            {buttons.map(button => {
              const isSecondary = button.variant === 'secondary';

              return (
                <Pressable
                  key={button.label}
                  onPress={button.onPress}
                  style={({ pressed }) => [
                    styles.button,
                    isSecondary
                      ? [
                          styles.secondaryButton,
                          {
                            backgroundColor:
                              resolvedTheme === 'dark'
                                ? withOpacity(COLORS.primary, 0.12)
                                : withOpacity(COLORS.primaryDark, 0.1),
                            borderColor: COLORS.primary,
                          },
                        ]
                      : [
                          styles.primaryButton,
                          {
                            backgroundColor: COLORS.primary,
                            borderColor: COLORS.primary,
                            shadowColor: COLORS.primary,
                          },
                        ],
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: isSecondary
                          ? COLORS.primary
                          : palette.primaryText,
                      },
                    ]}
                  >
                    {button.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const getIconName = (
  type: AlertType,
): React.ComponentProps<typeof Ionicons>['name'] => {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'close-circle';
    case 'warning':
      return 'alert-circle';
    case 'confirm':
      return 'help-circle';
    case 'info':
    default:
      return 'information-circle';
  }
};

const getAccentColor = (type: AlertType) => {
  switch (type) {
    case 'success':
      return COLORS.primary;
    case 'error':
      return '#FF6B6B';
    case 'warning':
      return '#FFC857';
    case 'confirm':
      return COLORS.primary;
    case 'info':
      return '#63B3FF';
    default:
      return COLORS.primary;
  }
};

const resolveTheme = (
  theme: CustomAlertPresentationOptions['theme'],
  systemScheme: ReturnType<typeof useColorScheme>,
): AlertTheme => {
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }

  return systemScheme === 'light' ? 'light' : 'dark';
};

const getAlertPalette = (theme: AlertTheme): AlertPalette => {
  if (theme === 'light') {
    return {
      backdrop: 'rgba(12, 18, 24, 0.22)',
      blurType: 'light',
      blurFallback: 'rgba(245, 248, 252, 0.92)',
      cardBackground: '#F8FBF6',
      borderBase: 'rgba(17, 24, 39, 0.08)',
      title: '#111827',
      message: '#4B5563',
      secondaryBorder: 'rgba(166, 255, 0, 0.3)',
      secondaryText: COLORS.primaryDark,
      primaryText: '#081106',
      shadowColor: '#0F172A',
    };
  }

  return {
    backdrop: 'rgba(4, 7, 4, 0.82)',
    blurType: 'dark',
    blurFallback: 'rgba(5, 8, 5, 0.95)',
    cardBackground: '#10180F',
    borderBase: COLORS.glassBorder,
    title: COLORS.textPrimary,
    message: COLORS.whiteSoft,
    secondaryBorder: withOpacity(COLORS.primary, 0.26),
    secondaryText: COLORS.primary,
    primaryText: '#081106',
    shadowColor: COLORS.primary,
  };
};

const withOpacity = (hexColor: string, opacity: number) => {
  const normalized = hexColor.replace('#', '');
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map(char => char + char)
          .join('')
      : normalized;

  const red = parseInt(fullHex.slice(0, 2), 16);
  const green = parseInt(fullHex.slice(2, 4), 16);
  const blue = parseInt(fullHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

export default CustomAlert;
