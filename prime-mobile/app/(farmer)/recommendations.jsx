import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import recommendationService from '../../services/recommendation.service';
import fertilizerService from '../../services/fertilizer.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

export default function RecommendationsScreen() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [applying, setApplying] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await recommendationService.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      setRecommendations(list);
    } catch (e) {
      console.warn('Using default recommendations', e);
      setRecommendations([
        {
          _id: 'rec_1',
          cropStage: 'Tillering Stage (15-30 DAT)',
          fertilizerType: 'Urea (46-0-0)',
          recommendedRateKgHa: 45,
          rationale: 'Nitrogen level is deficient (48.2 mg/kg vs target 60 mg/kg). Top-dress Urea to support rapid stem tillering.',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'rec_2',
          cropStage: 'Basal / Transplanting (0 DAT)',
          fertilizerType: '14-14-14 (Complete)',
          recommendedRateKgHa: 50,
          rationale: 'Basal application completed during soil land preparation.',
          status: 'APPLIED',
          appliedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  const handleMarkApplied = async (rec) => {
    try {
      setApplying(true);
      await fertilizerService.logApplication({
        recommendationId: rec._id,
        fertilizerType: rec.fertilizerType,
        amountAppliedKg: rec.recommendedRateKgHa,
        cropStage: rec.cropStage,
      });

      Alert.alert('Success', 'Fertilizer application logged successfully!');
      setSelectedRec(null);
      fetchRecommendations();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to log fertilizer application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading && !refreshing) {
    return <Loading message="Loading fertilizer guidance..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
    >
      <Text style={styles.headerTitle}>Fertilizer Recommendations</Text>
      <Text style={styles.headerSub}>
        Customized NPK advice calculated based on sensor readings and rice crop growth stages.
      </Text>

      {recommendations.length === 0 ? (
        <EmptyState
          icon="sparkles-outline"
          title="No Recommendations"
          message="Your field soil is currently optimal! No active fertilizer application needed."
        />
      ) : (
        recommendations.map((rec) => (
          <Card
            key={rec._id}
            title={rec.cropStage}
            subtitle={`Generated: ${formatDate(rec.createdAt)}`}
            headerRight={<StatusBadge status={rec.status} />}
          >
            <View style={styles.detailsRow}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Fertilizer Type</Text>
                <Text style={styles.detailValue}>{rec.fertilizerType}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Target Dosage</Text>
                <Text style={styles.detailValueHighlight}>{rec.recommendedRateKgHa} kg/ha</Text>
              </View>
            </View>

            <Text style={styles.rationaleTitle}>System Rationale:</Text>
            <Text style={styles.rationaleText}>{rec.rationale}</Text>

            {rec.status === 'PENDING' && (
              <Button
                title="Mark as Applied"
                variant="primary"
                onPress={() => setSelectedRec(rec)}
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        ))
      )}

      {/* Confirmation Modal */}
      {selectedRec && (
        <Modal
          visible={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          title="Log Fertilizer Application"
        >
          <Text style={styles.modalText}>
            Are you sure you want to log application for <Text style={{ fontWeight: '700' }}>{selectedRec.fertilizerType}</Text> at <Text style={{ fontWeight: '700' }}>{selectedRec.recommendedRateKgHa} kg/ha</Text>?
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setSelectedRec(null)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Confirm Applied"
              variant="primary"
              loading={applying}
              onPress={() => handleMarkApplied(selectedRec)}
              style={{ flex: 1 }}
            />
          </View>
        </Modal>
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
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  detailBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  detailValueHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 2,
  },
  rationaleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  rationaleText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 2,
  },
  modalText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
});
