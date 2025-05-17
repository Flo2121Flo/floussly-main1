import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  AccessibilityInfo
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Text, ActivityIndicator, Button } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useTransactionTrends } from '../../hooks/useTransactionTrends';
import { formatCurrency } from '../../utils/format';
import { theme } from '../../theme';

export const TransactionTrendsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  const {
    data: trends,
    isLoading,
    error,
    refetch
  } = useTransactionTrends(timeRange);

  // Accessibility announcement
  React.useEffect(() => {
    if (trends) {
      AccessibilityInfo.announceForAccessibility(
        t('transactions.trends.accessibility.summary', {
          volume: formatCurrency(trends.totalVolume),
          count: trends.totalTransactions
        })
      );
    }
  }, [trends, t]);

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
        <Text>{t('errors.failedToLoadTrends')}</Text>
        <Button onPress={refetch}>{t('common.retry')}</Button>
      </View>
    );
  }

  const chartData = {
    labels: trends?.data.map(d => d.date) || [],
    datasets: [
      {
        data: trends?.data.map(d => d.volume) || [],
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 2
      },
      {
        data: trends?.data.map(d => d.frequency) || [],
        color: (opacity = 1) => theme.colors.secondary,
        strokeWidth: 2
      }
    ],
    legend: [t('transactions.trends.volume'), t('transactions.trends.frequency')]
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityRole="scrollview"
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" accessibilityRole="header">
          {t('transactions.trends.title')}
        </Text>
        <View style={styles.timeRangeButtons}>
          <Button
            mode={timeRange === 'week' ? 'contained' : 'outlined'}
            onPress={() => setTimeRange('week')}
            accessibilityLabel={t('transactions.trends.timeRange.week')}
          >
            {t('transactions.trends.timeRange.week')}
          </Button>
          <Button
            mode={timeRange === 'month' ? 'contained' : 'outlined'}
            onPress={() => setTimeRange('month')}
            accessibilityLabel={t('transactions.trends.timeRange.month')}
          >
            {t('transactions.trends.timeRange.month')}
          </Button>
          <Button
            mode={timeRange === 'year' ? 'contained' : 'outlined'}
            onPress={() => setTimeRange('year')}
            accessibilityLabel={t('transactions.trends.timeRange.year')}
          >
            {t('transactions.trends.timeRange.year')}
          </Button>
        </View>
      </View>

      <View style={styles.cards}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" accessibilityRole="header">
              {t('transactions.trends.totalVolume')}
            </Text>
            <Text variant="headlineMedium" accessibilityRole="text">
              {formatCurrency(trends?.totalVolume || 0)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" accessibilityRole="header">
              {t('transactions.trends.totalTransactions')}
            </Text>
            <Text variant="headlineMedium" accessibilityRole="text">
              {trends?.totalTransactions || 0}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" accessibilityRole="header">
              {t('transactions.trends.averageAmount')}
            </Text>
            <Text variant="headlineMedium" accessibilityRole="text">
              {formatCurrency(trends?.averageAmount || 0)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" accessibilityRole="header">
            {t('transactions.trends.volumeTrend')}
          </Text>
          <LineChart
            data={chartData}
            width={width - 32}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.onSurface,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.primary
              }
            }}
            bezier
            style={styles.chart}
            accessibilityLabel={t('transactions.trends.accessibility.chart')}
          />
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
  header: {
    marginBottom: 16
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16
  },
  card: {
    flex: 1,
    minWidth: '45%',
    margin: 8
  },
  chartCard: {
    marginBottom: 16
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  }
}); 