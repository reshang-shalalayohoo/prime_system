import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TextInput, Alert } from 'react-native';
import fertilizerService from '../../services/fertilizer.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export default function FertilizerLogScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [fertilizerType, setFertilizerType] = useState('');
  const [amountAppliedKg, setAmountAppliedKg] = useState('');
  const [cropStage, setCropStage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fertilizerService.getHistory();
      const list = Array.isArray(res) ? res : res?.data || [];
      setLogs(list);
    } catch (e) {
      console.warn('Using default fertilizer logs', e);
      setLogs([
        {
          _id: 'log_1',
          fertilizerType: '14-14-14 (Complete)',
          amountAppliedKg: 50,
          cropStage: 'Basal / Land Prep',
          notes: 'Standard basal application during harrowing.',
          appliedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const handleCreateLog = async () => {
    if (!fertilizerType || !amountAppliedKg) {
      Alert.alert('Required Fields', 'Please enter fertilizer type and amount applied.');
      return;
    }

    try {
      setSubmitting(true);
      await fertilizerService.logApplication({
        fertilizerType,
        amountAppliedKg: Number(amountAppliedKg),
        cropStage: cropStage || 'General',
        notes,
      });

      Alert.alert('Success', 'Fertilizer application logged!');
      setModalVisible(false);
      setFertilizerType('');
      setAmountAppliedKg('');
      setCropStage('');
      setNotes('');
      fetchLogs();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to log application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return <Loading message="Loading application logs..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Application Log</Text>
          <Text style={styles.headerSub}>Track all fertilizer applications performed on your rice plot.</Text>
        </View>
        <Button
          title="Log New"
          icon={<Ionicons name="add" size={18} color="#fff" />}
          onPress={() => setModalVisible(true)}
          size="sm"
        />
      </View>

      {logs.length === 0 ? (
        <EmptyState
          icon="journal-outline"
          title="No Logs Recorded"
          message="Keep track of your field management by logging your first fertilizer application."
          actionLabel="Log Fertilizer"
          onAction={() => setModalVisible(true)}
        />
      ) : (
        logs.map((log) => (
          <Card
            key={log._id}
            title={log.fertilizerType}
            subtitle={`Applied on: ${formatDate(log.appliedAt || log.createdAt)}`}
            headerRight={<Text style={styles.amountTag}>{log.amountAppliedKg} kg/ha</Text>}
          >
            {log.cropStage && <Text style={styles.stageText}>Stage: {log.cropStage}</Text>}
            {log.notes && <Text style={styles.notesText}>{log.notes}</Text>}
          </Card>
        ))
      )}

      {/* Manual Entry Modal */}
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Log Fertilizer Application">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fertilizer Grade / Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Urea (46-0-0), 14-14-14, 16-20-0"
            value={fertilizerType}
            onChangeText={setFertilizerType}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount Applied (kg/ha) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            keyboardType="numeric"
            value={amountAppliedKg}
            onChangeText={setAmountAppliedKg}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Crop Stage</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Tillering, Panicle Initiation"
            value={cropStage}
            onChangeText={setCropStage}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes / Observations</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Weather conditions, field moisture..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => setModalVisible(false)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Save Record"
            variant="primary"
            loading={submitting}
            onPress={handleCreateLog}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  },
  amountTag: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});
