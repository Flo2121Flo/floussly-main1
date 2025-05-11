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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Book as BookIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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
      id={`doc-tabpanel-${index}`}
      aria-labelledby={`doc-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Documentation: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const documentationSections = [
    {
      title: t('documentation.sections.gettingStarted.title'),
      icon: <BookIcon />,
      content: t('documentation.sections.gettingStarted.content'),
    },
    {
      title: t('documentation.sections.account.title'),
      icon: <AccountIcon />,
      content: t('documentation.sections.account.content'),
    },
    {
      title: t('documentation.sections.payments.title'),
      icon: <PaymentIcon />,
      content: t('documentation.sections.payments.content'),
    },
    {
      title: t('documentation.sections.security.title'),
      icon: <SecurityIcon />,
      content: t('documentation.sections.security.content'),
    },
    {
      title: t('documentation.sections.settings.title'),
      icon: <SettingsIcon />,
      content: t('documentation.sections.settings.content'),
    },
  ];

  const quickGuides = [
    {
      title: t('documentation.guides.account.title'),
      description: t('documentation.guides.account.description'),
      icon: <AccountIcon />,
    },
    {
      title: t('documentation.guides.payments.title'),
      description: t('documentation.guides.payments.description'),
      icon: <PaymentIcon />,
    },
    {
      title: t('documentation.guides.security.title'),
      description: t('documentation.guides.security.description'),
      icon: <SecurityIcon />,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('documentation.title')}
        </Typography>

        {/* Search Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('documentation.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button variant="contained" color="primary">
                {t('documentation.search')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <List>
                {documentationSections.map((section, index) => (
                  <React.Fragment key={index}>
                    <ListItem button onClick={() => setSelectedTab(index)}>
                      <ListItemIcon>{section.icon}</ListItemIcon>
                      <ListItemText primary={section.title} />
                    </ListItem>
                    {index < documentationSections.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Content Area */}
          <Grid item xs={12} md={9}>
            <Paper>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                {documentationSections.map((section, index) => (
                  <Tab
                    key={index}
                    icon={section.icon}
                    label={section.title}
                    id={`doc-tab-${index}`}
                  />
                ))}
              </Tabs>

              {documentationSections.map((section, index) => (
                <TabPanel key={index} value={selectedTab} index={index}>
                  <Typography variant="h6" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography paragraph>{section.content}</Typography>
                </TabPanel>
              ))}
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Guides */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          {t('documentation.quickGuides.title')}
        </Typography>
        <Grid container spacing={3}>
          {quickGuides.map((guide, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {guide.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {guide.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" paragraph>
                    {guide.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    fullWidth
                  >
                    {t('documentation.readMore')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Help Section */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HelpIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6">
                  {t('documentation.needHelp.title')}
                </Typography>
                <Typography color="text.secondary">
                  {t('documentation.needHelp.description')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 'auto' }}
              >
                {t('documentation.contactSupport')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}; 