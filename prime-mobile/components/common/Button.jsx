import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#e2e8f0';
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return '#f1f5f9';
      case 'outline': return 'transparent';
      case 'danger': return COLORS.danger;
      case 'ghost': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#94a3b8';
    switch (variant) {
      case 'primary': return '#ffffff';
      case 'secondary': return '#0f172a';
      case 'outline': return COLORS.primary;
      case 'danger': return '#ffffff';
      case 'ghost': return '#64748b';
      default: return '#ffffff';
    }
  };

  const getBorderWidth = () => (variant === 'outline' ? 1.5 : 0);
  const getBorderColor = () => (variant === 'outline' ? (disabled ? '#cbd5e1' : COLORS.primary) : 'transparent');

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 24 };
      default: return { paddingVertical: 12, paddingHorizontal: 18 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 13;
      case 'lg': return 17;
      default: return 15;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        getPadding(),
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: getBorderWidth(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
              icon ? { marginLeft: 8 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
