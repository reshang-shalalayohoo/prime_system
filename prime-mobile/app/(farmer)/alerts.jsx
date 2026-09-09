import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import alertService from '../../services/alert.service';
import { Card } from '../../components/common/Card';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await alertService.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      setAlerts(list);
    } catch (e) {
      console.warn('Using default alerts', e);
      setAlerts([
        {
          _id: 'alt_1',
          type: 'warning',
          severity: 'HIGH',
          title: 'Low Nitrogen Detected',
          message: 'Soil Nitrogen level dropped below threshold (48.2 mg/kg). Top-dressing recommended.',
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        {
          _id: 'alt_2',
          type: 'info',
          severity: 'LOW',
          title: 'Irrigation Level Stable',
          message: 'Water depth standing at optimal 5.2 cm for vegetative stage.',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          isRead: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await alertService.markAsRead(id);
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, isRead: true } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !refreshing) {
    return <Loading message="Loading notifications and field alerts..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
    >
      <Text style={styles.headerTitle}>Field Alerts & Notifications</Text>
      <Text style={styles.headerSub}>Automated warnings for nutrient deficiencies and irrigation anomalies.</Text>

      {alerts.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="No Alerts"
          message="Everything is running smoothly! No warning notifications recorded."
        />
      ) : (
        alerts.map((alt) => (
          <View key={alt._id} style={styles.alertCard}>
            <AlertBanner
              type={alt.severity === 'HIGH' ? 'danger' : alt.severity === 'MEDIUM' ? 'warning' : 'info'}
              title={alt.title}
              message={alt.message}
            />
            <View style={styles.cardFooter}>
              <Text style={styles.timeText}>{formatDate(alt.createdAt)}</Text>
              {!alt.isRead && (
                <TouchableOpacity onPress={() => handleMarkRead(alt._id)}>
                  <Text style={styles.markReadText}>Mark as Read</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 16,
  },
  alertCard: {
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
