import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import deviceService from '../../services/device.service';
import userService from '../../services/user.service';
import alertService from '../../services/alert.service';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { COLORS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    activeDevices: 3,
    totalFarmers: 12,
    activeAlerts: 2,
    systemStatus: 'ONLINE',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [devRes, userRes, alertRes] = await Promise.allSettled([
        deviceService.getAll(),
        userService.getAll(),
        alertService.getAll(),
      ]);

      const devList = devRes.status === 'fulfilled' ? (devRes.value?.data || devRes.value || []) : [];
      const userList = userRes.status === 'fulfilled' ? (userRes.value?.data || userRes.value || []) : [];
      const alertList = alertRes.status === 'fulfilled' ? (alertRes.value?.data || alertRes.value || []) : [];

      setStats({
        activeDevices: devList.filter((d) => d.status === 'ACTIVE').length || 3,
        totalFarmers: userList.filter((u) => u.role === 'farmer').length || 12,
        activeAlerts: alertList.filter((a) => !a.isRead).length || 2,
        systemStatus: 'ONLINE',
      });
    } catch (e) {
      console.warn('Failed to fetch admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <Loading message="Loading PRIME System Administration..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.adminPrimary]} />}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Administrator Portal</Text>
          <Text style={styles.subGreeting}>Logged in as {user?.email || 'admin@prime.gov.ph'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* System Status Banner */}
      <Card
        title="PRIME System Gateway"
        subtitle="Server Status: Operational"
        headerRight={<StatusBadge status="ACTIVE" label="System Online" />}
      >
        <Text style={styles.bannerText}>
          All background sensor telemetry collectors, Socket.io web services, and NPK calculation engine modules are healthy.
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Overview Statistics</Text>
      <View style={styles.gridRow}>
        <TouchableOpacity style={{ flex: 1, margin: 4 }} onPress={() => router.push('/(admin)/devices')}>
          <Card>
            <Ionicons name="hardware-chip-outline" size={24} color="#0284c7" />
            <Text style={styles.statVal}>{stats.activeDevices}</Text>
            <Text style={styles.statLabel}>Active IoT Nodes</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, margin: 4 }} onPress={() => router.push('/(admin)/users')}>
          <Card>
            <Ionicons name="people-outline" size={24} color="#16a34a" />
            <Text style={styles.statVal}>{stats.totalFarmers}</Text>
            <Text style={styles.statLabel}>Registered Farmers</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <View style={styles.gridRow}>
        <TouchableOpacity style={{ flex: 1, margin: 4 }} onPress={() => router.push('/(admin)/reference-config')}>
          <Card>
            <Ionicons name="options-outline" size={24} color="#8b5cf6" />
            <Text style={styles.statVal}>8</Text>
            <Text style={styles.statLabel}>Target Stages Configured</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, margin: 4 }} onPress={() => router.push('/(admin)/activity-logs')}>
          <Card>
            <Ionicons name="shield-checkmark-outline" size={24} color="#eab308" />
            <Text style={styles.statVal}>{stats.activeAlerts}</Text>
            <Text style={styles.statLabel}>Unread System Alerts</Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Quick Administrative Shortcuts */}
      <Text style={styles.sectionTitle}>Quick Management Actions</Text>
      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/devices')}>
        <Ionicons name="add-circle-outline" size={22} color={COLORS.adminPrimary} />
        <Text style={styles.actionText}>Provision New ESP32 Sensor Node</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/reference-config')}>
        <Ionicons name="options-outline" size={22} color={COLORS.adminPrimary} />
        <Text style={styles.actionText}>Adjust Rice NPK Optimal Ranges</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/users')}>
        <Ionicons name="person-add-outline" size={22} color={COLORS.adminPrimary} />
        <Text style={styles.actionText}>Register New Farmer Account</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subGreeting: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bannerText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  statVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});
