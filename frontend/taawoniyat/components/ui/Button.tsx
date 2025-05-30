import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { designSystem } from '@/theme/designSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? designSystem.colors.primary[500] : '#FFFFFF'} 
        />
      ) : (
        <>
          {icon}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: designSystem.borderRadius.md,
    gap: designSystem.spacing.sm,
    ...designSystem.shadows.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: designSystem.colors.primary[500],
  },
  secondary: {
    backgroundColor: designSystem.colors.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: designSystem.colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  sm: {
    paddingVertical: designSystem.spacing.sm,
    paddingHorizontal: designSystem.spacing.md,
  },
  md: {
    paddingVertical: designSystem.spacing.sm + 4,
    paddingHorizontal: designSystem.spacing.lg,
  },
  lg: {
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.xl,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: designSystem.typography.weights.semibold,
    textAlign: 'center',
  },
  
  // Text variants
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: designSystem.colors.primary[500],
  },
  ghostText: {
    color: designSystem.colors.primary[500],
  },
  
  // Text sizes
  smText: {
    fontSize: designSystem.typography.sizes.sm,
  },
  mdText: {
    fontSize: designSystem.typography.sizes.base,
  },
  lgText: {
    fontSize: designSystem.typography.sizes.lg,
  },
  
  disabledText: {
    opacity: 0.7,
  },
});
