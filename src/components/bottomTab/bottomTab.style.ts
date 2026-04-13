import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 20,
      width: '100%',
      alignItems: 'center',
    },
    tabBar: {
      flexDirection: 'row',
      width: width * 0.9,
      backgroundColor: COLORS.backgroundGradientStart,
      borderRadius: 40,
      paddingVertical: 12,
      paddingHorizontal: 10,
      shadowColor: COLORS.ringGlow,
      shadowOpacity: 0.2,
      shadowRadius: 15,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      elevation: 10,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 30,
    },
    activeTab: {
      backgroundColor: COLORS.primaryDark,
      shadowColor: COLORS.primary,
      shadowOpacity: 0.6,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 8,
    },
    icon: {
      fontSize: 18,
      color: COLORS.textPrimary,
    },
    activeIcon: {
      color: COLORS.textPrimary,
    },
    label: {
      marginTop: 4,
      fontSize: 12,
      color: COLORS.textPrimary,
      fontWeight: '600',
    },
  });

  export default styles;
  

