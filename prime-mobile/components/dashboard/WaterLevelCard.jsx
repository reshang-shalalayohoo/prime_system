import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { formatNumber } from '../../utils/formatters';

export const WaterLevelCard = ({ waterLevel = 5.2, soilMoisture = 68.5, status = 'OPTIMAL' }) => {
  return (
    <Card title="Irrigation & Soil Hydration" headerRight={<StatusBadge status={status} />}>
      <View style={styles.container}>
        <View style={styles.metric}>
          <Text style={styles.label}>Water Level (Depth)</Text>
          <View style={styles.valRow}>
            <Text style={styles.bigVal}>{formatNumber(waterLevel, 1)}</Text>
            <Text style={styles.unit}> cm</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Text style={styles.label}>Soil Moisture</Text>
          <View style={styles.valRow}>
            <Text style={styles.bigVal}>{formatNumber(soilMoisture, 1)}</Text>
            <Text style={styles.unit}> %</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bigVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0284c7',
  },
  unit: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
