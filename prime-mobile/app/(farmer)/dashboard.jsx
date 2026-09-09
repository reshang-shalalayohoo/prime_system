import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useSensorData } from '../../hooks/useSensorData';
import { SensorStatusCard } from '../../components/dashboard/SensorStatusCard';
import { NutrientCard } from '../../components/dashboard/NutrientCard';
import { WaterLevelCard } from '../../components/dashboard/WaterLevelCard';
import { RecommendationCard } from '../../components/dashboard/RecommendationCard';
import { NutrientTrendChart } from '../../components/charts/NutrientTrendChart';
import { SoilMoistureChart } from '../../components/charts/SoilMoistureChart';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { AlertBanner } from '../../components/common/AlertBanner';
import { COLORS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const { latestData, history, assessment, loading, error, refetch, isConnected } = useSensorData();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !latestData && !refreshing) {
    return <Loading message="Connecting to PRIME sensors..." />;
  }

  if (error && !latestData) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const nitrogen = latestData?.nitrogen ?? 48.2;
  const phosphorus = latestData?.phosphorus ?? 22.4;
  const potassium = latestData?.potassium ?? 65.0;
  const ph = latestData?.ph ?? 6.5;
  const soilMoisture = latestData?.soilMoisture ?? 68.5;
  const waterLevel = latestData?.waterLevel ?? 5.2;

  const mockRec = assessment?.recommendation || {
    cropStage: 'Tillering (15-30 DAT)',
    fertilizerType: 'Urea (46-0-0) + 14-14-14',
    recommendedRateKgHa: 45,
    rationale: 'Nitrogen level is currently below target range for optimal tillering stage. Apply split application within 3 days.',
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
    >
      {/* Welcome Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Kamusta, {user?.name || 'Farmer'} 👋</Text>
          <Text style={styles.fieldInfo}>Field #001 — Palay Rice Plot</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {!isConnected && (
        <AlertBanner
          type="warning"
          title="Offline Mode"
          message="Reconnecting to field sensor gateway..."
        />
      )}

      {/* Sensor Node Card */}
      <SensorStatusCard
        deviceId={latestData?.deviceId || 'ESP32_NODE_01'}
        status={latestData?.status || 'ACTIVE'}
        lastReadingAt={latestData?.timestamp}
        isConnected={isConnected}
      />

      {/* Fertilizer Recommendation Banner */}
      <RecommendationCard
        recommendation={mockRec}
        onViewDetails={() => router.push('/(farmer)/recommendations')}
      />

      {/* Real-Time Soil Nutrients (NPK + pH) */}
      <Text style={styles.sectionTitle}>Real-Time Soil Nutrients</Text>
      <View style={styles.gridRow}>
        <NutrientCard name="Nitrogen" symbol="N" value={nitrogen} rangeMin={50} rangeMax={80} status={nitrogen < 50 ? 'DEFICIENT' : 'OPTIMAL'} color="#16a34a" />
        <NutrientCard name="Phosphorus" symbol="P" value={phosphorus} rangeMin={20} rangeMax={40} status="OPTIMAL" color="#0284c7" />
      </View>

      <View style={styles.gridRow}>
        <NutrientCard name="Potassium" symbol="K" value={potassium} rangeMin={60} rangeMax={100} status="OPTIMAL" color="#eab308" />
        <NutrientCard name="Soil pH" symbol="pH" value={ph} rangeMin={6.0} rangeMax={7.0} status="OPTIMAL" color="#8b5cf6" />
      </View>

      {/* Water & Irrigation */}
      <Text style={styles.sectionTitle}>Irrigation & Water Level</Text>
      <WaterLevelCard waterLevel={waterLevel} soilMoisture={soilMoisture} status={waterLevel < 3 ? 'DEFICIENT' : 'OPTIMAL'} />

      {/* Historical Trend Charts */}
      <Text style={styles.sectionTitle}>Sensor Trends</Text>
      <NutrientTrendChart data={history} />
      <SoilMoistureChart data={history} />
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  fieldInfo: {
    fontSize: 13,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
});
