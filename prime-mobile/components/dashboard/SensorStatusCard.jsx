import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { formatTime } from '../../utils/formatters';

export const SensorStatusCard = ({ deviceId, status = 'ACTIVE', lastReadingAt, batteryLevel, isConnected = true }) => {
  return (
    <Card
      title={`Device ${deviceId || 'FIELD_NODE_01'}`}
      subtitle={`Last ping: ${lastReadingAt ? formatTime(lastReadingAt) : 'Just now'}`}
      headerRight={<StatusBadge status={isConnected ? status : 'INACTIVE'} label={isConnected ? 'Online' : 'Offline'} />}
    >
      <View style={styles.grid}>
        <View style={styles.item}>
          <Ionicons name="hardware-chip-outline" size={20} color="#16a34a" />
          <View style={styles.itemText}>
            <Text style={styles.label}>Status</Text>

            <Text style={styles.value}>{status}</Text>

          </View>
        </View>

        <View style={styles.item}>
          <Ionicons name="battery-charging-outline" size={20} color="#0284c7" />
          <View style={styles.itemText}>
            <Text style={styles.label}>Battery / Power</Text>
            <Text style={styles.value}>{batteryLevel ? `${batteryLevel}%` : '98% (Solar)'}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    marginLeft: 8,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
});
