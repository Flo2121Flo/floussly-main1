import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  AccessibilityInfo
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  Searchbar,
  Chip,
  IconButton,
  Menu,
  Divider
} from 'react-native-paper';
import { useAgents } from '../../hooks/useAgents';
import { theme } from '../../theme';
import { Agent } from '../../types/agent';

export const AgentManagementScreen: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    agents,
    isLoading,
    error,
    refetch,
    updateAgentStatus,
    generateReport
  } = useAgents();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleStatusChange = async (agentId: string, newStatus: string) => {
    try {
      await updateAgentStatus(agentId, newStatus);
      AccessibilityInfo.announceForAccessibility(
        t('agents.statusUpdated', { status: newStatus })
      );
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleGenerateReport = async (agentId: string) => {
    try {
      await generateReport(agentId);
      AccessibilityInfo.announceForAccessibility(t('agents.reportGenerated'));
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const filteredAgents = agents?.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || agent.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{t('errors.failedToLoadAgents')}</Text>
        <Button onPress={refetch}>{t('common.retry')}</Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      accessibilityRole="scrollview"
    >
      <Text
        variant="headlineMedium"
        style={styles.title}
        accessibilityRole="header"
      >
        {t('agents.title')}
      </Text>

      <View style={styles.filters}>
        <Searchbar
          placeholder={t('agents.search')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          accessibilityLabel={t('agents.search')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilters}
          accessibilityRole="scrollview"
        >
          <Chip
            selected={!selectedStatus}
            onPress={() => setSelectedStatus(null)}
            style={styles.chip}
            accessibilityLabel={t('agents.allStatuses')}
          >
            {t('agents.allStatuses')}
          </Chip>
          <Chip
            selected={selectedStatus === 'active'}
            onPress={() => setSelectedStatus('active')}
            style={styles.chip}
            accessibilityLabel={t('agents.status.active')}
          >
            {t('agents.status.active')}
          </Chip>
          <Chip
            selected={selectedStatus === 'inactive'}
            onPress={() => setSelectedStatus('inactive')}
            style={styles.chip}
            accessibilityLabel={t('agents.status.inactive')}
          >
            {t('agents.status.inactive')}
          </Chip>
          <Chip
            selected={selectedStatus === 'pending'}
            onPress={() => setSelectedStatus('pending')}
            style={styles.chip}
            accessibilityLabel={t('agents.status.pending')}
          >
            {t('agents.status.pending')}
          </Chip>
        </ScrollView>
      </View>

      {filteredAgents?.map(agent => (
        <Card key={agent.id} style={styles.card}>
          <Card.Content>
            <View style={styles.agentHeader}>
              <View>
                <Text
                  variant="titleMedium"
                  accessibilityRole="header"
                >
                  {agent.name}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={styles.agentId}
                  accessibilityRole="text"
                >
                  {t('agents.id')}: {agent.id}
                </Text>
              </View>
              <Menu
                visible={menuVisible === agent.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => setMenuVisible(agent.id)}
                    accessibilityLabel={t('agents.actions')}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    handleStatusChange(agent.id, 'active');
                    setMenuVisible(null);
                  }}
                  title={t('agents.actions.activate')}
                />
                <Menu.Item
                  onPress={() => {
                    handleStatusChange(agent.id, 'inactive');
                    setMenuVisible(null);
                  }}
                  title={t('agents.actions.deactivate')}
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    handleGenerateReport(agent.id);
                    setMenuVisible(null);
                  }}
                  title={t('agents.actions.generateReport')}
                />
              </Menu>
            </View>

            <View style={styles.agentDetails}>
              <View style={styles.detailItem}>
                <Text variant="bodySmall">{t('agents.status')}</Text>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { backgroundColor: theme.colors[agent.status] }
                  ]}
                >
                  {t(`agents.status.${agent.status}`)}
                </Chip>
              </View>
              <View style={styles.detailItem}>
                <Text variant="bodySmall">{t('agents.transactions')}</Text>
                <Text variant="bodyMedium">{agent.transactionCount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text variant="bodySmall">{t('agents.volume')}</Text>
                <Text variant="bodyMedium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(agent.transactionVolume)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
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
  searchBar: {
    marginBottom: 8
  },
  statusFilters: {
    flexDirection: 'row',
    marginBottom: 8
  },
  chip: {
    marginRight: 8
  },
  card: {
    marginBottom: 16
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  agentId: {
    opacity: 0.7
  },
  agentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailItem: {
    alignItems: 'center'
  },
  statusChip: {
    marginTop: 4
  }
}); 