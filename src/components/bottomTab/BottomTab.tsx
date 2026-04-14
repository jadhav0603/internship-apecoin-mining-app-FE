import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
// import { useAppTheme } from '../../hooks/useAppTheme';
// import { useI18n } from '../../utils/i18n';

import styles from './bottomTab.style';

type TabItem = {
  name: 'Home' | 'Wallet' | 'Reward' | 'Profile';
  icon: string;
  labelKey: 'home' | 'wallet' | 'reward' | 'profile';
};

const tabs: TabItem[] = [
  { name: 'Home', icon: '\uD83C\uDFE0', labelKey: 'home' },
  { name: 'Wallet', icon: '\uD83D\uDCDC', labelKey: 'wallet' },
  { name: 'Reward', icon: '\uD83C\uDFB5', labelKey: 'reward' },
  { name: 'Profile', icon: '\uD83D\uDC64', labelKey: 'profile' },
];

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
  state: {
    index: number;
  };
};

const BottomTab = ({ state, navigation }: Props) => {
//   const { colors } = useAppTheme();
//   const { t } = useI18n();
//   const styles = useMemo(() => Styles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isActive = state.index === index;
          const label = (tab.labelKey);

          return (
            <TouchableOpacity
              key={tab.name}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(tab.name)}
              style={[styles.tabItem, isActive && styles.activeTab]}
            >
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {tab.icon}
              </Text>

              {isActive && <Text style={styles.label}>{label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomTab;
