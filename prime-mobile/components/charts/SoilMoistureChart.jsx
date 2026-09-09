import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';

export const SoilMoistureChart = ({ data = [], title = "Soil Moisture & Water Level Trend" }) => {
  const chartItems = data.length > 0 ? data.slice(0, 7) : [
    { label: '06:00', moisture: 65, waterLevel: 5.0 },
    { label: '09:00', moisture: 68, waterLevel: 5.2 },
    { label: '12:00', moisture: 62, waterLevel: 4.8 },
    { label: '15:00', moisture: 70, waterLevel: 5.5 },
    { label: '18:00', moisture: 67, waterLevel: 5.3 },
    { label: '21:00', moisture: 66, waterLevel: 5.1 },
  ];

  return (
    <Card title={title}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0284c7' }]} />
          <Text style={styles.legendText}>Moisture (%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#06b6d4' }]} />
          <Text style={styles.legendText}>Water Depth (cm)</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {chartItems.map((item, idx) => {
          const moistureH = ((item.moisture || item.soilMoisture || 0) / 100) * 110;
          const waterH = (((item.waterLevel || 0) * 10) / 100) * 110;

          return (
            <View key={idx} style={styles.columnGroup}>
              <View style={styles.barPair}>
                <View style={[styles.bar, { height: Math.max(moistureH, 8), backgroundColor: '#0284c7' }]} />
                <View style={[styles.bar, { height: Math.max(waterH, 4), backgroundColor: '#06b6d4' }]} />
              </View>
              <Text style={styles.xLabel}>{item.label || `${idx+1}h`}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
  },
  columnGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 110,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  xLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 6,
  },
});
