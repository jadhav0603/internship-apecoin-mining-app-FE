import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/COLORS';
import useBottomOverlayPadding from '../../hooks/useBottomOverlayPadding';
import styles from './tabScene.styles';

type SceneMetric = {
  label: string;
  value: string;
};

type TabSceneProps = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: SceneMetric[];
  cardTitle: string;
  cardBody: string;
  children?: React.ReactNode;
};

const TabScene = ({
  eyebrow,
  title,
  description,
  metrics,
  cardTitle,
  cardBody,
  children,
}: TabSceneProps) => {
  const bottomContentPadding = useBottomOverlayPadding(36);

  return (
    <LinearGradient
      colors={[
        COLORS.backgroundGradientStart,
        COLORS.backgroundGradientMid,
        COLORS.backgroundGradientEnd,
      ]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.background}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.primaryGlow} />
        <View style={styles.secondaryGlow} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomContentPadding },
          ]}>
          <LinearGradient
            colors={['rgba(31, 44, 13, 0.94)', 'rgba(11, 16, 8, 0.98)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </LinearGradient>

          <View style={styles.metricsRow}>
            {metrics.map(metric => (
              <View key={metric.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>

          <LinearGradient
            colors={['rgba(16, 24, 9, 0.96)', 'rgba(8, 12, 6, 0.98)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.detailCard}>
            <Text style={styles.detailTitle}>{cardTitle}</Text>
            <Text style={styles.detailBody}>{cardBody}</Text>
          </LinearGradient>

          {children ? <View style={styles.footer}>{children}</View> : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TabScene;
