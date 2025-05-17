import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Download as DownloadIcon } from '@mui/icons-material';
import { format } from 'date-fns';

export const Privacy: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDownloadPDF = () => {
    // Implement PDF generation and download
    window.print();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: isMobile ? 2 : 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            {t('privacy.title')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
          >
            {t('privacy.downloadPDF')}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('privacy.lastUpdated', { date: format(new Date(), 'MMMM d, yyyy') })}
        </Typography>

        <Box component="section" mb={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('privacy.introduction.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.introduction.content')}
          </Typography>
        </Box>

        <Box component="section" mb={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('privacy.dataCollection.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.dataCollection.content')}
          </Typography>
          <ul>
            <li>{t('privacy.dataCollection.items.personal')}</li>
            <li>{t('privacy.dataCollection.items.financial')}</li>
            <li>{t('privacy.dataCollection.items.usage')}</li>
            <li>{t('privacy.dataCollection.items.device')}</li>
          </ul>
        </Box>

        <Box component="section" mb={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('privacy.dataUsage.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.dataUsage.content')}
          </Typography>
        </Box>

        <Box component="section" mb={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('privacy.dataSharing.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.dataSharing.content')}
          </Typography>
        </Box>

        <Box component="section" mb={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('privacy.security.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.security.content')}
          </Typography>
        </Box>

        <Box component="section" mb={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('privacy.rights.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.rights.content')}
          </Typography>
          <ul>
            <li>{t('privacy.rights.items.access')}</li>
            <li>{t('privacy.rights.items.correction')}</li>
            <li>{t('privacy.rights.items.deletion')}</li>
            <li>{t('privacy.rights.items.portability')}</li>
          </ul>
        </Box>

        <Box component="section">
          <Typography variant="h6" component="h2" gutterBottom>
            {t('privacy.contact.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.contact.content')}
          </Typography>
          <Typography>
            Email: privacy@floussly.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}; 