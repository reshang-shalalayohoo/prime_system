import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatters';

export const RecommendationCard = ({ recommendation, onApply, onViewDetails }) => {
  if (!recommendation) return null;

  const { cropStage, fertilizerType, recommendedRateKgHa, rationale, createdAt, status = 'PENDING' } = recommendation;

  return (
    <Card
      title="Active Fertilizer Recommendation"
      subtitle={`Stage: ${cropStage || 'Vegetative'}`}
      headerRight={<StatusBadge status={status} />}
    >
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <Text style={styles.fertType}>{fertilizerType || 'Urea (46-0-0)'}</Text>
          <Text style={styles.rate}>{recommendedRateKgHa || 45} kg/ha</Text>
        </View>

        {rationale && <Text style={styles.rationale} numberOfLines={3}>{rationale}</Text>}

        <Text style={styles.date}>Generated: {formatDate(createdAt)}</Text>

        <View style={styles.btnRow}>
          {onViewDetails && (
            <Button
              title="Details"
              variant="outline"
              size="sm"
              onPress={onViewDetails}
              style={{ flex: 1, marginRight: 8 }}
            />
          )}
          {status === 'PENDING' && onApply && (
            <Button
              title="Mark Applied"
              variant="primary"
              size="sm"
              onPress={onApply}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  fertType: {
    fontWeight: '700',
    color: '#15803d',
    fontSize: 15,
  },
  rate: {
    fontWeight: '800',
    color: '#166534',
    fontSize: 16,
  },
  rationale: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
  },
});
