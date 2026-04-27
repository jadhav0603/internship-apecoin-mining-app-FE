import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME } from './profileTheme';

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

const styles = StyleSheet.create({
  pressableWrap: {
    marginBottom: 12,
  },
  pressableWrapPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  menuItemActive: {
    borderColor: 'rgba(170,255,0,0.24)',
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.12,
  },
  menuItemDanger: {
    borderColor: 'rgba(255,92,92,0.22)',
  },
  menuItemDisabled: {
    opacity: 0.7,
  },
  menuGlow: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(170,255,0,0.08)',
  },
  menuIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    color: PROFILE_THEME.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  menuLabelDanger: {
    color: PROFILE_THEME.danger,
  },
  menuHint: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.54)',
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 17,
  },
  menuHintDanger: {
    color: 'rgba(255,180,180,0.66)',
  },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(170,255,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(170,255,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  chevronWrapDanger: {
    backgroundColor: 'rgba(255,92,92,0.08)',
    borderColor: 'rgba(255,92,92,0.14)',
  },
});

export default ProfileMenuItem;
