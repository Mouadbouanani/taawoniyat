import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { designSystem } from '@/theme/designSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style
}: CardProps) {
  const paddingKey = `padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles;
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[paddingKey],
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: designSystem.borderRadius.lg,
  },

  // Variants
  default: {
    ...designSystem.shadows.sm,
  },
  elevated: {
    ...designSystem.shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: designSystem.colors.neutral[200],
  },

  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: designSystem.spacing.sm,
  },
  paddingMd: {
    padding: designSystem.spacing.md,
  },
  paddingLg: {
    padding: designSystem.spacing.lg,
  },
});
