import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import styles from './CurvedEarningsGraph.style';

export type MultiLineChartFilter = 'all' | 'reward' | 'mining' | 'referral';

export type MultiLineChartData = {
  labels: string[];
  rewardEarning: number[];
  miningEarning: number[];
  referralEarning: number[];
};

type MultiLineChartProps = {
  data: MultiLineChartData;
  filter?: MultiLineChartFilter;
  activeIndex?: number;
  height?: number;
  valueText?: string;
};

type SeriesKey = 'reward' | 'mining' | 'referral';

type ChartPoint = {
  x: number;
  y: number;
  value: number;
  label: string;
};

type SeriesConfig = {
  key: SeriesKey;
  values: number[];
  color: string;
};

const DEFAULT_HEIGHT = 210;
const DEFAULT_WIDTH = 360;
const BADGE_WIDTH = 92;
const LABEL_TRACK_HEIGHT = 54;
const Y_TOP = 18;
const Y_BOTTOM_PADDING = 28;
const X_SIDE_PADDING = 12;
const Y_AXIS_GUTTER = 28;
const AXIS_COLOR = 'rgba(255,255,255,0.14)';
const Y_AXIS_SEGMENTS = 3;

const SERIES_COLORS: Record<SeriesKey, string> = {
  reward: '#3B82F6',
  mining: '#8B5CF6',
  referral: '#22C55E',
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toSafeNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const formatValue = (value: number) =>
  `${value >= 0 ? '+' : '-'}${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatAxisValue = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    });
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: value > 0 && value < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

const getVisibleKeys = (filter: MultiLineChartFilter): SeriesKey[] => {
  if (filter === 'all') {
    return ['reward', 'mining', 'referral'];
  }

  return [filter];
};

const buildSmoothPath = (points: ChartPoint[]) => {
  if (!points.length) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = (current.x + next.x) / 2;

    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
};

const buildAreaPath = (points: ChartPoint[], bottomY: number) => {
  if (!points.length) {
    return '';
  }

  const first = points[0];
  const last = points[points.length - 1];

  return `${buildSmoothPath(points)} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
};

const MultiLineChart = ({
  data,
  filter = 'all',
  activeIndex = 0,
  height = DEFAULT_HEIGHT,
  valueText,
}: MultiLineChartProps) => {
  const [layoutWidth, setLayoutWidth] = useState(DEFAULT_WIDTH);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    riseAnim.setValue(12);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [data, fadeAnim, filter, riseAnim]);

  const safeActiveIndex = clamp(activeIndex, 0, Math.max(data.labels.length - 1, 0));
  const chartWidth = Math.max(layoutWidth - 28, 240);
  const chartHeight = height;
  const chartBottom = chartHeight - Y_BOTTOM_PADDING;
  const chartDrawableHeight = chartBottom - Y_TOP;
  const plotLeft = Y_AXIS_GUTTER + X_SIDE_PADDING;
  const plotRight = chartWidth - X_SIDE_PADDING;
  const plotWidth = Math.max(plotRight - plotLeft, 120);
  const visibleKeys = getVisibleKeys(filter);

  const visibleSeries = useMemo<SeriesConfig[]>(
    () =>
      visibleKeys.map(key => ({
        key,
        values:
          key === 'reward'
            ? data.rewardEarning
            : key === 'mining'
              ? data.miningEarning
              : data.referralEarning,
        color: SERIES_COLORS[key],
      })),
    [data.miningEarning, data.referralEarning, data.rewardEarning, visibleKeys],
  );

  const maxVisibleValue = useMemo(() => {
    let nextMax = 0;

    for (const series of visibleSeries) {
      for (const value of series.values) {
        const safeValue = Math.abs(toSafeNumber(value));
        if (safeValue > nextMax) {
          nextMax = safeValue;
        }
      }
    }

    return Math.max(nextMax, 1);
  }, [visibleSeries]);

  const pointSets = useMemo(() => {
    const centerX = plotLeft + plotWidth / 2;
    const leftX = plotLeft;
    const rightX = plotRight;
    const leftCount = safeActiveIndex;
    const rightCount = data.labels.length - safeActiveIndex - 1;

    return visibleSeries.map(series => ({
      ...series,
      points: data.labels.map((label, index) => {
        let x = centerX;

        if (index < safeActiveIndex) {
          const ratio = leftCount <= 0 ? 0 : index / leftCount;
          x = leftX + ratio * (centerX - leftX);
        } else if (index > safeActiveIndex) {
          const step = index - safeActiveIndex;
          const ratio = rightCount <= 0 ? 0 : step / rightCount;
          x = centerX + ratio * (rightX - centerX);
        }

        const value = toSafeNumber(series.values[index]);
        const normalized = clamp(value / maxVisibleValue, 0, 1);
        const y = chartBottom - normalized * chartDrawableHeight;

        return {
          x,
          y,
          value,
          label,
        };
      }),
    }));
  }, [
    chartBottom,
    chartDrawableHeight,
    data.labels,
    maxVisibleValue,
    plotLeft,
    plotRight,
    plotWidth,
    safeActiveIndex,
    visibleSeries,
  ]);

  const axisGuideLines = useMemo(
    () =>
      Array.from({ length: Y_AXIS_SEGMENTS + 1 }, (_, index) => {
        const ratio = (Y_AXIS_SEGMENTS - index) / Y_AXIS_SEGMENTS;

        return {
          label: formatAxisValue(maxVisibleValue * ratio),
          y: chartBottom - ratio * chartDrawableHeight,
        };
      }),
    [chartBottom, chartDrawableHeight, maxVisibleValue],
  );

  const anchorSeries = useMemo(() => {
    if (!pointSets.length) {
      return null;
    }

    return pointSets.reduce((best, current) => {
      const bestValue = best.points[safeActiveIndex]?.value ?? 0;
      const currentValue = current.points[safeActiveIndex]?.value ?? 0;
      return currentValue >= bestValue ? current : best;
    });
  }, [pointSets, safeActiveIndex]);

  const activePoint = anchorSeries?.points[safeActiveIndex] ?? null;

  const defaultValueText = useMemo(() => {
    const activeTotal = visibleSeries.reduce(
      (sum, series) => sum + toSafeNumber(series.values[safeActiveIndex]),
      0,
    );

    return formatValue(activeTotal);
  }, [safeActiveIndex, visibleSeries]);

  const badgeText = valueText ?? defaultValueText;
  const badgeLeft = activePoint
    ? clamp(activePoint.x - BADGE_WIDTH / 2 + 14, 14, chartWidth - BADGE_WIDTH + 14)
    : 0;
  const badgeTop = activePoint ? Math.max(activePoint.y - 58, 2) : 0;

  const handleLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  const labelStep = Math.max(1, Math.ceil(data.labels.length / 6));

  return (
    <View
      style={[styles.card, { height: chartHeight + LABEL_TRACK_HEIGHT }]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          styles.innerWrap,
          {
            opacity: fadeAnim,
            transform: [{ translateY: riseAnim }],
          },
        ]}
      >
        <View style={[styles.chartViewport, { height: chartHeight }]}>
          {activePoint ? (
            <View
              pointerEvents="none"
              style={[
                styles.valueBadge,
                {
                  left: badgeLeft,
                  top: badgeTop,
                },
              ]}
            >
              <Text style={styles.valueBadgeText}>{badgeText}</Text>
            </View>
          ) : null}

          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              {pointSets.map(series => (
                <LinearGradient
                  key={`gradient-${series.key}`}
                  id={`gradient-${series.key}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor={series.color} stopOpacity="0.2" />
                  <Stop offset="100%" stopColor={series.color} stopOpacity="0" />
                </LinearGradient>
              ))}
            </Defs>

            {axisGuideLines.map(line => (
              <Path
                key={`guide-${line.label}`}
                d={`M ${plotLeft} ${line.y} L ${plotRight} ${line.y}`}
                stroke={AXIS_COLOR}
                strokeWidth={1}
                fill="none"
              />
            ))}

            <Path
              d={`M ${plotLeft} ${Y_TOP} L ${plotLeft} ${chartBottom}`}
              stroke={AXIS_COLOR}
              strokeWidth={1}
              fill="none"
            />
            <Path
              d={`M ${plotLeft} ${chartBottom} L ${plotRight} ${chartBottom}`}
              stroke={AXIS_COLOR}
              strokeWidth={1}
              fill="none"
            />

            {pointSets.map(series => (
              <Path
                key={`area-${series.key}`}
                d={buildAreaPath(series.points, chartBottom)}
                fill={`url(#gradient-${series.key})`}
                opacity={filter === 'all' ? 0.05 : 0.16}
              />
            ))}

            {pointSets.map(series => (
              <Path
                key={`ghost-${series.key}`}
                d={buildSmoothPath(
                  series.points.map(point => ({
                    ...point,
                    y: point.y + 1.5,
                  })),
                )}
                stroke={series.color}
                strokeOpacity={0.14}
                strokeWidth={7}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {pointSets.map(series => (
              <Path
                key={`line-${series.key}`}
                d={buildSmoothPath(series.points)}
                stroke={series.color}
                strokeWidth={3.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {activePoint && anchorSeries ? (
              <>
                <Circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r={11}
                  fill={anchorSeries.color}
                  opacity={0.18}
                />
                <Circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r={6.5}
                  fill="#FFFFFF"
                  stroke={anchorSeries.color}
                  strokeWidth={2.4}
                />
                <Circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r={2.8}
                  fill={anchorSeries.color}
                />
              </>
            ) : null}
          </Svg>

          <View pointerEvents="none" style={styles.yAxisLabels}>
            {axisGuideLines.map(line => (
              <Text
                key={`axis-label-${line.label}`}
                style={[
                  styles.yAxisLabel,
                  {
                    top: line.y - 9,
                  },
                ]}
              >
                {line.label}
              </Text>
            ))}
          </View>
        </View>

        <View style={[styles.monthsRow, { paddingLeft: plotLeft - 8, paddingRight: 10 }]}>
          {data.labels.map((label, index) => {
            const isActive = index === safeActiveIndex;
            const shouldShowLabel =
              data.labels.length <= 8 ||
              isActive ||
              index === 0 ||
              index === data.labels.length - 1 ||
              index % labelStep === 0;

            return (
              <View key={`${label}-${index}`} style={styles.monthCell}>
                {isActive ? <View style={styles.activeMonthBackground} /> : null}
                <Text style={[styles.monthLabel, isActive && styles.monthLabelActive]}>
                  {shouldShowLabel ? label : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

export default MultiLineChart;
