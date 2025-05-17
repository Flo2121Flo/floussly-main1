import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  AccessibilityInfo
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Text,
  SegmentedButtons,
  ActivityIndicator,
  Chip
} from 'react-native-paper';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { useAnalytics } from '../hooks/useAnalytics';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

type TimeRange = 'week' | 'month' | 'year';
type ChartType = 'savings' | 'agents';

export const AnalyticsDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedChart, setSelectedChart] = useState<ChartType>('savings');

  const {
    savingsData,
    agentData,
    isLoading,
    error,
    refetch
  } = useAnalytics(timeRange);

  const renderSavingsChart = () => {
    if (!savingsData) return null;

    return (
      <VictoryChart
        width={width - 32}
        height={300}
        padding={{ top: 20, bottom: 40, left: 60, right: 20 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.y.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}`}
            labelComponent={
              <VictoryTooltip
                style={{ fill: theme.colors.onSurface }}
                flyoutStyle={{
                  fill: theme.colors.surface,
                  stroke: theme.colors.outline
                }}
              />
            }
          />
        }
      >
        <VictoryAxis
          tickFormat={(t) => new Date(t).toLocaleDateString()}
          style={{
            tickLabels: { angle: -45, fontSize: 10 }
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => t.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          })}
        />
        <VictoryLine
          data={savingsData}
          x="date"
          y="amount"
          style={{
            data: { stroke: theme.colors.primary }
          }}
        />
      </VictoryChart>
    );
  };

  const renderAgentChart = () => {
    if (!agentData) return null;

    return (
      <VictoryChart
        width={width - 32}
        height={300}
        padding={{ top: 20, bottom: 40, left: 60, right: 20 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.y} actions`}
            labelComponent={
              <VictoryTooltip
                style={{ fill: theme.colors.onSurface }}
                flyoutStyle={{
                  fill: theme.colors.surface,
                  stroke: theme.colors.outline
                }}
              />
            }
          />
        }
      >
        <VictoryAxis
          tickFormat={(t) => new Date(t).toLocaleDateString()}
          style={{
            tickLabels: { angle: -45, fontSize: 10 }
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => Math.round(t)}
        />
        <VictoryLine
          data={agentData}
          x="date"
          y="actions"
          style={{
            data: { stroke: theme.colors.primary }
          }}
        />
      </VictoryChart>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{t('errors.failedToLoadAnalytics')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityRole="scrollview"
    >
      <Text
        variant="headlineMedium"
        style={styles.title}
        accessibilityRole="header"
      >
        {t('analytics.title')}
      </Text>

      <View style={styles.filters}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={value => setTimeRange(value as TimeRange)}
          buttons={[
            { value: 'week', label: t('analytics.timeRanges.week') },
            { value: 'month', label: t('analytics.timeRanges.month') },
            { value: 'year', label: t('analytics.timeRanges.year') }
          ]}
          style={styles.timeRangeButtons}
        />

        <View style={styles.chartTypeButtons}>
          <Chip
            selected={selectedChart === 'savings'}
            onPress={() => setSelectedChart('savings')}
            style={styles.chip}
          >
            {t('analytics.chartTypes.savings')}
          </Chip>
          <Chip
            selected={selectedChart === 'agents'}
            onPress={() => setSelectedChart('agents')}
            style={styles.chip}
          >
            {t('analytics.chartTypes.agents')}
          </Chip>
        </View>
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={styles.chartTitle}
            accessibilityRole="header"
          >
            {selectedChart === 'savings'
              ? t('analytics.savingsTrend')
              : t('analytics.agentPerformance')}
          </Text>
          {selectedChart === 'savings' ? renderSavingsChart() : renderAgentChart()}
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={styles.statsTitle}
            accessibilityRole="header"
          >
            {t('analytics.keyMetrics')}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="bodySmall">{t('analytics.totalSavings')}</Text>
              <Text variant="titleLarge">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(savingsData?.reduce((sum, item) => sum + item.amount, 0) || 0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall">{t('analytics.activeAgents')}</Text>
              <Text variant="titleLarge">
                {agentData?.length || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall">{t('analytics.totalTransactions')}</Text>
              <Text variant="titleLarge">
                {agentData?.reduce((sum, item) => sum + item.actions, 0) || 0}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  content: {
    padding: 16
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    marginBottom: 16
  },
  filters: {
    marginBottom: 16
  },
  timeRangeButtons: {
    marginBottom: 8
  },
  chartTypeButtons: {
    flexDirection: 'row',
    marginBottom: 8
  },
  chip: {
    marginRight: 8
  },
  chartCard: {
    marginBottom: 16
  },
  chartTitle: {
    marginBottom: 16
  },
  statsCard: {
    marginBottom: 16
  },
  statsTitle: {
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    alignItems: 'center'
  }
}); 