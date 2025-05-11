import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Help as HelpIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const Support: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: t('support.categories.account.title'),
      icon: <AccountIcon />,
      questions: [
        {
          question: t('support.categories.account.q1'),
          answer: t('support.categories.account.a1'),
        },
        {
          question: t('support.categories.account.q2'),
          answer: t('support.categories.account.a2'),
        },
      ],
    },
    {
      title: t('support.categories.payments.title'),
      icon: <PaymentIcon />,
      questions: [
        {
          question: t('support.categories.payments.q1'),
          answer: t('support.categories.payments.a1'),
        },
        {
          question: t('support.categories.payments.q2'),
          answer: t('support.categories.payments.a2'),
        },
      ],
    },
    {
      title: t('support.categories.security.title'),
      icon: <SecurityIcon />,
      questions: [
        {
          question: t('support.categories.security.q1'),
          answer: t('support.categories.security.a1'),
        },
        {
          question: t('support.categories.security.q2'),
          answer: t('support.categories.security.a2'),
        },
      ],
    },
  ];

  const contactMethods = [
    {
      title: t('support.contact.email.title'),
      description: t('support.contact.email.description'),
      icon: <EmailIcon />,
      action: t('support.contact.email.action'),
    },
    {
      title: t('support.contact.phone.title'),
      description: t('support.contact.phone.description'),
      icon: <PhoneIcon />,
      action: t('support.contact.phone.action'),
    },
    {
      title: t('support.contact.chat.title'),
      description: t('support.contact.chat.description'),
      icon: <ChatIcon />,
      action: t('support.contact.chat.action'),
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('support.title')}
        </Typography>

        {/* Search Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('support.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button variant="contained" color="primary">
                {t('support.search')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Typography variant="h5" gutterBottom>
          {t('support.faq.title')}
        </Typography>
        <Grid container spacing={3}>
          {faqCategories.map((category, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {category.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {category.title}
                    </Typography>
                  </Box>
                  {category.questions.map((faq, faqIndex) => (
                    <Accordion key={faqIndex}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{faq.question}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{faq.answer}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Contact Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          {t('support.contact.title')}
        </Typography>
        <Grid container spacing={3}>
          {contactMethods.map((method, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {method.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {method.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" paragraph>
                    {method.description}
                  </Typography>
                  <Button variant="outlined" startIcon={method.icon}>
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Links */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          {t('support.quickLinks.title')}
        </Typography>
        <Card>
          <CardContent>
            <List>
              <ListItem button>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText primary={t('support.quickLinks.gettingStarted')} />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary={t('support.quickLinks.securityGuide')} />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <PaymentIcon />
                </ListItemIcon>
                <ListItemText primary={t('support.quickLinks.paymentGuide')} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}; 