import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../hooks/useSnackbar';
import { useAML } from '../hooks/useAML';

export const AML: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const {
    riskScore,
    suspiciousActivities,
    complianceStatus,
    isLoading,
    error,
    refreshData,
  } = useAML();

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error.message}
        </Alert>
      </Container>
    );
  }

  const getRiskScoreColor = (score: number) => {
    if (score <= 30) return 'success';
    if (score <= 70) return 'warning';
    return 'error';
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'success';
      case 'warning':
        return 'warning';
      case 'non-compliant':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {t('aml.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            {t('common.refresh')}
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Risk Score Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('aml.riskScore')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`${riskScore}%`}
                    color={getRiskScoreColor(riskScore)}
                    size="large"
                  />
                  <Typography variant="body2" color="textSecondary">
                    {t('aml.riskScoreDescription')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Compliance Status Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('aml.complianceStatus')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={t(`aml.status.${complianceStatus.toLowerCase()}`)}
                    color={getComplianceStatusColor(complianceStatus)}
                    size="large"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Suspicious Activities Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('aml.suspiciousActivities')}
                </Typography>
                <Typography variant="h4" color="error">
                  {suspiciousActivities.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('aml.suspiciousActivitiesDescription')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Suspicious Activities Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('aml.recentActivities')}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('aml.activity.type')}</TableCell>
                        <TableCell>{t('aml.activity.user')}</TableCell>
                        <TableCell>{t('aml.activity.amount')}</TableCell>
                        <TableCell>{t('aml.activity.date')}</TableCell>
                        <TableCell>{t('aml.activity.status')}</TableCell>
                        <TableCell>{t('aml.activity.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {suspiciousActivities.map((activity) => (
                        <TableRow
                          key={activity.id}
                          hover
                          onClick={() => setSelectedActivity(activity.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{activity.type}</TableCell>
                          <TableCell>{activity.userName}</TableCell>
                          <TableCell>
                            {activity.amount} {activity.currency}
                          </TableCell>
                          <TableCell>
                            {new Date(activity.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={t(`aml.activity.status.${activity.status}`)}
                              color={
                                activity.status === 'pending'
                                  ? 'warning'
                                  : activity.status === 'resolved'
                                  ? 'success'
                                  : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/aml/${activity.userId}`);
                              }}
                            >
                              {t('aml.activity.investigate')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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