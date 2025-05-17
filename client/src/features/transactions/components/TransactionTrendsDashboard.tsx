import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTransactionTrends } from '../hooks/useTransactionTrends';
import { formatCurrency } from '../../../utils/format';

interface TrendData {
  date: string;
  volume: number;
  frequency: number;
  averageAmount: number;
}

export const TransactionTrendsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  const {
    data: trends,
    isLoading,
    error,
    refetch
  } = useTransactionTrends(timeRange);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress aria-label={t('common.loading')} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" role="alert">
        {t('errors.failedToLoadTrends')}
      </Alert>
    );
  }

  return (
    <Box component="section" aria-label={t('transactions.trends.title')}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('transactions.trends.totalVolume')}
              </Typography>
              <Typography variant="h4" component="p">
                {formatCurrency(trends?.totalVolume || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('transactions.trends.totalTransactions')}
              </Typography>
              <Typography variant="h4" component="p">
                {trends?.totalTransactions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('transactions.trends.averageAmount')}
              </Typography>
              <Typography variant="h4" component="p">
                {formatCurrency(trends?.averageAmount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Trends Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('transactions.trends.volumeTrend')}
              </Typography>
              <Box height={isMobile ? 300 : 400}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trends?.data || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ fontSize: isMobile ? 12 : 14 }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke={theme.palette.primary.main}
                      name={t('transactions.trends.volume')}
                    />
                    <Line
                      type="monotone"
                      dataKey="frequency"
                      stroke={theme.palette.secondary.main}
                      name={t('transactions.trends.frequency')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 