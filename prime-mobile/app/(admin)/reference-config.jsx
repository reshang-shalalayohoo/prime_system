import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TextInput, Alert } from 'react-native';
import referenceService from '../../services/reference.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { COLORS } from '../../utils/constants';

export default function AdminReferenceConfigScreen() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      const res = await referenceService.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      setStages(list);
    } catch (e) {
      console.warn('Using default reference thresholds', e);
      setStages([
        {
          _id: 'ref_1',
          stageName: 'Basal / Land Preparation (0 DAT)',
          targetN: 40,
          targetP: 30,
          targetK: 40,
          minWaterLevel: 2.0,
          maxWaterLevel: 5.0,
        },
        {
          _id: 'ref_2',
          stageName: 'Tillering Stage (15-30 DAT)',
          targetN: 60,
          targetP: 25,
          targetK: 60,
          minWaterLevel: 3.0,
          maxWaterLevel: 7.0,
        },
        {
          _id: 'ref_3',
          stageName: 'Panicle Initiation (40-50 DAT)',
          targetN: 70,
          targetP: 20,
          targetK: 80,
          minWaterLevel: 5.0,
          maxWaterLevel: 10.0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReferenceData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <Loading message="Loading rice crop NPK reference values..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.adminPrimary]} />}
    >
      <Text style={styles.headerTitle}>Rice Crop Target NPK Thresholds</Text>
      <Text style={styles.headerSub}>
        Calibrate target nutrient ranges across Palay growth stages used by the decision engine.
      </Text>

      {stages.map((stg) => (
        <Card key={stg._id || stg.stageName} title={stg.stageName}>
          <View style={styles.thresholdGrid}>
            <View style={styles.tBox}>
              <Text style={styles.tLabel}>Nitrogen (N)</Text>
              <Text style={[styles.tVal, { color: '#16a34a' }]}>{stg.targetN} mg/kg</Text>
            </View>
            <View style={styles.tBox}>
              <Text style={styles.tLabel}>Phosphorus (P)</Text>
              <Text style={[styles.tVal, { color: '#0284c7' }]}>{stg.targetP} mg/kg</Text>
            </View>
            <View style={styles.tBox}>
              <Text style={styles.tLabel}>Potassium (K)</Text>
              <Text style={[styles.tVal, { color: '#eab308' }]}>{stg.targetK} mg/kg</Text>
            </View>
          </View>

          <View style={styles.waterBox}>
            <Text style={styles.wText}>
              Ideal Water Level Range: <Text style={{ fontWeight: '700' }}>{stg.minWaterLevel} - {stg.maxWaterLevel} cm</Text>
            </Text>
          </View>
        </Card>
      ))}
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
  thresholdGrid: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  tBox: {
    flex: 1,
    alignItems: 'center',
  },
  tLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  tVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  waterBox: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  wText: {
    fontSize: 12,
    color: '#475569',
  },
});
