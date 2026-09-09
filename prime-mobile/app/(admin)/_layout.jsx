import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.adminPrimary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.adminPrimary,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Admin Console',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'IoT Sensor Management',
          tabBarLabel: 'Devices',
          tabBarIcon: ({ color, size }) => <Ionicons name="hardware-chip-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reference-config"
        options={{
          title: 'NPK Threshold Config',
          tabBarLabel: 'Thresholds',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'User Management',
          tabBarLabel: 'Users',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity-logs"
        options={{
          title: 'System Audit Logs',
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'System Analytics',
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
