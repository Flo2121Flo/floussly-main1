import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { TransactionTrendsScreen } from '../screens/TransactionTrendsScreen';
import { KYCDocumentUploadScreen } from '../screens/KYCDocumentUploadScreen';
import { AgentManagementScreen } from '../screens/AgentManagementScreen';
import { GroupSavingsScreen } from '../screens/GroupSavingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransactionTrends"
        component={TransactionTrendsScreen}
        options={{
          title: t('transactions.trends'),
          headerBackTitle: t('common.back')
        }}
      />
      <Stack.Screen
        name="KYCDocumentUpload"
        component={KYCDocumentUploadScreen}
        options={{
          title: t('kyc.title'),
          headerBackTitle: t('common.back')
        }}
      />
    </Stack.Navigator>
  );
};

const TransactionsStack = () => {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionTrendsScreen}
        options={{
          title: t('transactions.details'),
          headerBackTitle: t('common.back')
        }}
      />
    </Stack.Navigator>
  );
};

const SavingsStack = () => {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GroupSavings"
        component={GroupSavingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgentManagement"
        component={AgentManagementScreen}
        options={{
          title: t('agents.title'),
          headerBackTitle: t('common.back')
        }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface
        }
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          headerShown: false,
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="TransactionsStack"
        component={TransactionsStack}
        options={{
          headerShown: false,
          title: t('navigation.transactions'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="swap-horizontal" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="SavingsStack"
        component={SavingsStack}
        options={{
          headerShown: false,
          title: t('navigation.savings'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="piggy-bank" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}; 