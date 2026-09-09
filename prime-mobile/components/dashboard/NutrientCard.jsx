import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { formatNutrientValue } from '../../utils/formatters';

export const NutrientCard = ({ name, symbol, value, unit, status = 'OPTIMAL', rangeMin, rangeMax, color = '#16a34a' }) => {
  return (
    <Card className="flex-1 min-w-[150px] m-1">
      <View style={styles.topRow}>
        <View style={[styles.symbolBadge, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.symbolText, { color }]}>{symbol}</Text>
        </View>
        <StatusBadge status={status} />
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.value}>
        {formatNutrientValue(value, name)}
      </Text>

      {rangeMin !== undefined && rangeMax !== undefined && (
        <Text style={styles.range}>
          Ideal: {rangeMin} - {rangeMax} {unit || ''}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbolBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontWeight: '800',
    fontSize: 15,
  },
  name: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 4,
  },
  range: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
