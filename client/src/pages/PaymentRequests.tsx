import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from '../hooks/useSnackbar';
import { PaymentRequestList } from '../components/payment-requests/PaymentRequestList';
import { CreatePaymentRequestDialog } from '../components/payment-requests/CreatePaymentRequestDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { usePaymentRequests } from '../hooks/usePaymentRequests';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-request-tabpanel-${index}`}
      aria-labelledby={`payment-request-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const PaymentRequests: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    sentRequests,
    receivedRequests,
    isLoading,
    error,
    refetch,
  } = usePaymentRequests();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch();
    showSnackbar(t('paymentRequests.create.success'), 'success');
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('paymentRequests.title')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            {t('paymentRequests.create.title')}
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="payment request tabs"
            variant={isMobile ? 'fullWidth' : 'standard'}
          >
            <Tab label={t('paymentRequests.list.received')} />
            <Tab label={t('paymentRequests.list.sent')} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <PaymentRequestList
            requests={receivedRequests}
            type="received"
            onAction={refetch}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <PaymentRequestList
            requests={sentRequests}
            type="sent"
            onAction={refetch}
          />
        </TabPanel>

        <CreatePaymentRequestDialog
          open={isCreateDialogOpen}
          onClose={handleCreateClose}
          onSuccess={handleCreateSuccess}
        />
      </Box>
    </Container>
  );
}; 