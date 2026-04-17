import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
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
        styles.menuItem,
        active && styles.menuItemActive,
        isDanger && styles.menuItemDanger,
        pressed && styles.menuItemPressed,
        disabled && styles.menuItemDisabled,
        style,
      ]}
    >
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

      <Text style={[styles.menuLabel, isDanger && styles.menuLabelDanger]}>
        {label}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={isDanger ? PROFILE_THEME.danger : PROFILE_THEME.chevron}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROFILE_THEME.cardBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PROFILE_THEME.menuBorder,
  },
  menuItemActive: {
    borderLeftWidth: 3,
    borderLeftColor: PROFILE_THEME.neonGreen,
    backgroundColor: '#152015',
  },
  menuItemDanger: {
    borderColor: PROFILE_THEME.dangerBorder,
    backgroundColor: '#171010',
  },
  menuItemPressed: {
    opacity: 0.88,
  },
  menuItemDisabled: {
    opacity: 0.7,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    color: PROFILE_THEME.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    flex: 1,
  },
  menuLabelDanger: {
    color: PROFILE_THEME.danger,
  },
});

export default ProfileMenuItem;
