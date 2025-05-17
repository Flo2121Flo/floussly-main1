import React, { useState } from 'react';
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
  FAB,
  Dialog,
  Portal,
  TextInput,
  HelperText
} from 'react-native-paper';
import { useGroupSavings } from '../../hooks/useGroupSavings';
import { theme } from '../../theme';
import { GroupSavings } from '../../types/savings';

export const GroupSavingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTarget, setNewGroupTarget] = useState('');
  const [newGroupError, setNewGroupError] = useState('');

  const {
    groups,
    isLoading,
    error,
    refetch,
    createGroup,
    joinGroup,
    leaveGroup,
    contribute
  } = useGroupSavings();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setNewGroupError(t('savings.errors.nameRequired'));
      return;
    }

    const targetAmount = parseFloat(newGroupTarget);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setNewGroupError(t('savings.errors.invalidTarget'));
      return;
    }

    try {
      await createGroup({
        name: newGroupName.trim(),
        targetAmount
      });
      setCreateDialogVisible(false);
      setNewGroupName('');
      setNewGroupTarget('');
      setNewGroupError('');
      AccessibilityInfo.announceForAccessibility(t('savings.groupCreated'));
    } catch (err) {
      setNewGroupError(t('savings.errors.createFailed'));
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      AccessibilityInfo.announceForAccessibility(t('savings.joinedGroup'));
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup(groupId);
      AccessibilityInfo.announceForAccessibility(t('savings.leftGroup'));
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleContribute = async (groupId: string, amount: number) => {
    try {
      await contribute(groupId, amount);
      AccessibilityInfo.announceForAccessibility(t('savings.contributionMade'));
    } catch (err) {
      // Error handling is done in the hook
    }
  };

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
        <Text>{t('errors.failedToLoadGroups')}</Text>
        <Button onPress={refetch}>{t('common.retry')}</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
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
          {t('savings.title')}
        </Text>

        {groups?.map(group => (
          <Card key={group.id} style={styles.card}>
            <Card.Content>
              <Text
                variant="titleMedium"
                accessibilityRole="header"
              >
                {group.name}
              </Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(group.currentAmount / group.targetAmount) * 100}%` }
                    ]}
                  />
                </View>
                <Text variant="bodySmall">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(group.currentAmount)} / {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(group.targetAmount)}
                </Text>
              </View>

              <View style={styles.memberInfo}>
                <Text variant="bodySmall">
                  {t('savings.members', { count: group.memberCount })}
                </Text>
                <Text variant="bodySmall">
                  {t('savings.nextContribution', {
                    date: new Date(group.nextContributionDate).toLocaleDateString()
                  })}
                </Text>
              </View>

              <View style={styles.actions}>
                {group.isMember ? (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => handleContribute(group.id, group.contributionAmount)}
                      style={styles.actionButton}
                      accessibilityLabel={t('savings.actions.contribute')}
                    >
                      {t('savings.actions.contribute')}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleLeaveGroup(group.id)}
                      style={styles.actionButton}
                      accessibilityLabel={t('savings.actions.leave')}
                    >
                      {t('savings.actions.leave')}
                    </Button>
                  </>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => handleJoinGroup(group.id)}
                    style={styles.actionButton}
                    accessibilityLabel={t('savings.actions.join')}
                  >
                    {t('savings.actions.join')}
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Dialog
          visible={createDialogVisible}
          onDismiss={() => setCreateDialogVisible(false)}
          accessibilityRole="dialog"
        >
          <Dialog.Title>{t('savings.createGroup')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('savings.groupName')}
              value={newGroupName}
              onChangeText={setNewGroupName}
              style={styles.input}
              accessibilityLabel={t('savings.groupName')}
            />
            <TextInput
              label={t('savings.targetAmount')}
              value={newGroupTarget}
              onChangeText={setNewGroupTarget}
              keyboardType="numeric"
              style={styles.input}
              accessibilityLabel={t('savings.targetAmount')}
            />
            {newGroupError ? (
              <HelperText type="error">{newGroupError}</HelperText>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateDialogVisible(false)}>
              {t('common.cancel')}
            </Button>
            <Button onPress={handleCreateGroup}>
              {t('common.create')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setCreateDialogVisible(true)}
        accessibilityLabel={t('savings.createGroup')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollView: {
    flex: 1
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
  card: {
    marginBottom: 16
  },
  progressContainer: {
    marginVertical: 16
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4
  },
  memberInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  actionButton: {
    marginLeft: 8
  },
  input: {
    marginBottom: 16
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0
  }
}); 