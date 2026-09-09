import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from '../common/Card';

const { width } = Dimensions.get('window');

export const NutrientTrendChart = ({ data = [], title = "NPK Nutrient Trends" }) => {
  // If data is empty or minimal, render dummy/fallback visual trend bars
  const chartItems = data.length > 0 ? data.slice(0, 7) : [
    { label: 'Mon', N: 45, P: 22, K: 65 },
    { label: 'Tue', N: 48, P: 20, K: 60 },
    { label: 'Wed', N: 42, P: 24, K: 68 },
    { label: 'Thu', N: 50, P: 25, K: 70 },
    { label: 'Fri', N: 52, P: 23, K: 67 },
    { label: 'Sat', N: 49, P: 21, K: 64 },
    { label: 'Sun', N: 51, P: 24, K: 66 },
  ];

  const maxVal = Math.max(...chartItems.map(i => Math.max(i.N || 0, i.P || 0, i.K || 0)), 100);

  return (
    <Card title={title}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#16a34a' }]} />
          <Text style={styles.legendText}>Nitrogen (N)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0284c7' }]} />
          <Text style={styles.legendText}>Phosphorus (P)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
          <Text style={styles.legendText}>Potassium (K)</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {chartItems.map((item, idx) => {
          const nHeight = ((item.N || item.nitrogen || 0) / maxVal) * 120;
          const pHeight = ((item.P || item.phosphorus || 0) / maxVal) * 120;
          const kHeight = ((item.K || item.potassium || 0) / maxVal) * 120;

          return (
            <View key={idx} style={styles.barGroup}>
              <View style={styles.barsContainer}>
                <View style={[styles.bar, { height: Math.max(nHeight, 6), backgroundColor: '#16a34a' }]} />
                <View style={[styles.bar, { height: Math.max(pHeight, 6), backgroundColor: '#0284c7' }]} />
                <View style={[styles.bar, { height: Math.max(kHeight, 6), backgroundColor: '#eab308' }]} />
              </View>
              <Text style={styles.xLabel}>{item.label || `T${idx+1}`}</Text>
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
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 120,
  },
  bar: {
    width: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  xLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 6,
  },
});
