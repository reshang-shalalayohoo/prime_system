// PRIME System — Color palette and app constants

export const COLORS = {
  primary: '#16a34a',       // green-600
  primaryDark: '#15803d',   // green-700
  primaryLight: '#22c55e',  // green-500
  primaryBg: '#f0fdf4',     // green-50
  primaryBorder: '#bbf7d0', // green-200

  water: '#0284c7',         // sky-600
  waterLight: '#0ea5e9',    // sky-500
  waterBg: '#f0f9ff',       // sky-50

  earth: '#92400e',         // amber-800
  earthLight: '#d97706',    // amber-600
  earthBg: '#fffbeb',       // amber-50

  danger: '#dc2626',        // red-600
  dangerBg: '#fef2f2',      // red-50
  dangerBorder: '#fecaca',  // red-200

  warning: '#f59e0b',       // amber-500
  warningBg: '#fffbeb',     // amber-50

  success: '#16a34a',       // green-600
  successBg: '#f0fdf4',     // green-50

  purple: '#7c3aed',        // violet-600
  purpleBg: '#f5f3ff',      // violet-50

  text: '#1f2937',          // gray-800
  textSecondary: '#6b7280', // gray-500
  textMuted: '#9ca3af',     // gray-400
  textLight: '#d1d5db',     // gray-300

  bg: '#f9fafb',            // gray-50
  bgWhite: '#ffffff',
  bgCard: '#ffffff',
  border: '#e5e7eb',        // gray-200
  borderLight: '#f3f4f6',   // gray-100

  black: '#000000',
  white: '#ffffff',
};

export const NUTRIENT_STATUS = {
  Deficient: { label: 'Deficient', color: '#dc2626', bg: '#fef2f2', icon: '↓' },
  Sufficient: { label: 'Sufficient', color: '#16a34a', bg: '#f0fdf4', icon: '✓' },
  Excess: { label: 'Excess', color: '#f59e0b', bg: '#fffbeb', icon: '↑' },
};

export const DEVICE_STATUS = {
  online: { label: 'Online', color: '#16a34a', bg: '#f0fdf4', dot: '🟢' },
  offline: { label: 'Offline', color: '#dc2626', bg: '#fef2f2', dot: '🔴' },
  fault: { label: 'Fault', color: '#f59e0b', bg: '#fffbeb', dot: '🟡' },
};

export const SENSOR_HEALTH = {
  ok: { label: 'Working', color: '#16a34a', dot: '🟢' },
  fault: { label: 'Fault', color: '#dc2626', dot: '🔴' },
  degraded: { label: 'Degraded', color: '#f59e0b', dot: '🟡' },
};

export const ALERT_SEVERITY = {
  info: { color: '#3b82f6', bg: '#eff6ff', label: 'Info' },
  warning: { color: '#f59e0b', bg: '#fffbeb', label: 'Warning' },
  critical: { color: '#dc2626', bg: '#fef2f2', label: 'Critical' },
};

export const GROWTH_STAGES = [
  'Seedling',
  'Vegetative',
  'Reproductive',
  'Ripening',
];

export const FERTILIZER_TYPES = [
  'Urea (46-0-0)',
  'Solophos (0-18-0)',
  'Muriate of Potash (0-0-60)',
  'Complete (14-14-14)',
  'Ammonium Phosphate (16-20-0)',
  'Other',
];
