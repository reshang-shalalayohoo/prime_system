import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Card = ({ children, title, subtitle, headerRight, style, className = '' }) => {
  return (
    <View style={[styles.card, style]} className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4 ${className}`}>
      {(title || subtitle || headerRight) && (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});
