import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export const AlertBanner = ({ type = 'info', title, message, onClose, actionLabel, onAction }) => {
  const getConfig = () => {
    switch (type) {
      case 'warning':
        return { bg: '#fffbe finished', border: '#fde047', text: '#92400e', icon: 'warning-outline' };
      case 'danger':
      case 'error':
      case 'critical':
        return { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: 'alert-circle-outline' };
      case 'success':
        return { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: 'checkmark-circle-outline' };
      default:
        return { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: 'information-circle-outline' };
    }
  };

  const config = getConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Ionicons name={config.icon} size={22} color={config.text} style={styles.icon} />
      <View style={{ flex: 1 }}>
        {title && <Text style={[styles.title, { color: config.text }]}>{title}</Text>}
        {message && <Text style={[styles.message, { color: config.text }]}>{message}</Text>}
        {actionLabel && (
          <TouchableOpacity onPress={onAction} style={{ marginTop: 6 }}>
            <Text style={[styles.action, { color: config.text }]}>{actionLabel} →</Text>
          </TouchableOpacity>
        )}
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={18} color={config.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
    marginTop: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
  },
  message: {
    fontSize: 13,
    marginTop: 2,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  closeBtn: {
    padding: 2,
    marginLeft: 8,
  },
});
