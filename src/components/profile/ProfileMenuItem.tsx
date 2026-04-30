import React from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME } from './profileTheme';
import styles from './ProfileMenuItem.style';


type ProfileMenuItemProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  onPress: () => void;
  active?: boolean;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const ProfileMenuItem = ({
  label,
  icon,
  iconBg,
  onPress,
  active = false,
  tone = 'default',
  disabled = false,
  style,
}: ProfileMenuItemProps) => {
  const isDanger = tone === 'danger';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressableWrap,
        pressed && styles.pressableWrapPressed,
        disabled && styles.menuItemDisabled,
        style,
      ]}
    >
      <LinearGradient
        colors={
          isDanger
            ? ['rgba(53, 20, 20, 0.96)', 'rgba(24, 12, 12, 0.98)']
            : active
              ? ['rgba(28, 42, 18, 0.98)', 'rgba(14, 22, 12, 0.96)']
              : ['rgba(23, 31, 20, 0.96)', 'rgba(12, 18, 13, 0.96)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.menuItem,
          active && styles.menuItemActive,
          isDanger && styles.menuItemDanger,
        ]}
      >
        {!isDanger ? <View style={styles.menuGlow} /> : null}

        <View
          style={[
            styles.menuIconBox,
            {
              backgroundColor: isDanger ? PROFILE_THEME.dangerBg : iconBg,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={isDanger ? PROFILE_THEME.danger : PROFILE_THEME.neonGreen}
          />
        </View>

        <View style={styles.menuCopy}>
          <Text style={[styles.menuLabel, isDanger && styles.menuLabelDanger]}>
            {label}
          </Text>
          <Text style={[styles.menuHint, isDanger && styles.menuHintDanger]}>
            {isDanger ? 'Securely sign out of your session' : 'Manage and review this section'}
          </Text>
        </View>

        <View style={[styles.chevronWrap, isDanger && styles.chevronWrapDanger]}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDanger ? PROFILE_THEME.danger : PROFILE_THEME.neonGreen}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export default ProfileMenuItem;
