import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [reportType, setReportType] = useState('transactions');
  const [timeFrame, setTimeFrame] = useState('monthly');

  // Sample data - replace with actual API calls
  const transactionData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  const categoryData = [
    { name: 'Transfers', value: 400 },
    { name: 'Payments', value: 300 },
    { name: 'Withdrawals', value: 300 },
    { name: 'Deposits', value: 200 },
  ];

  const trendData = [
    { name: 'Week 1', transactions: 24, amount: 2400 },
    { name: 'Week 2', transactions: 13, amount: 1398 },
    { name: 'Week 3', transactions: 98, amount: 2000 },
    { name: 'Week 4', transactions: 39, amount: 3080 },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('reports.title')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>{t('reports.type')}</InputLabel>
              <Select
                value={reportType}
                label={t('reports.type')}
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="transactions">{t('reports.types.transactions')}</MenuItem>
                <MenuItem value="categories">{t('reports.types.categories')}</MenuItem>
                <MenuItem value="trends">{t('reports.types.trends')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>{t('reports.timeFrame')}</InputLabel>
              <Select
                value={timeFrame}
                label={t('reports.timeFrame')}
                onChange={(e) => setTimeFrame(e.target.value)}
              >
                <MenuItem value="daily">{t('reports.timeFrames.daily')}</MenuItem>
                <MenuItem value="weekly">{t('reports.timeFrames.weekly')}</MenuItem>
                <MenuItem value="monthly">{t('reports.timeFrames.monthly')}</MenuItem>
                <MenuItem value="yearly">{t('reports.timeFrames.yearly')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t('reports.startDate')}
                value={dateRange[0]}
                onChange={(date) => setDateRange([date, dateRange[1]])}
              />
              <DatePicker
                label={t('reports.endDate')}
                value={dateRange[1]}
                onChange={(date) => setDateRange([dateRange[0], date])}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('reports.transactionVolume')}
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('reports.categoryDistribution')}
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('reports.transactionTrends')}
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="transactions" stroke="#8884d8" />
                      <Line type="monotone" dataKey="amount" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('reports.detailedTransactions')}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('reports.date')}</TableCell>
                        <TableCell>{t('reports.type')}</TableCell>
                        <TableCell>{t('reports.amount')}</TableCell>
                        <TableCell>{t('reports.status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Add your transaction data here */}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 