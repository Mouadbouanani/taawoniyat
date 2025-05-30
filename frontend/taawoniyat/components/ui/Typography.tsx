import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { designSystem, getTypography } from '@/theme/designSystem';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'button' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({
  children,
  variant = 'body1',
  color = designSystem.colors.neutral[900],
  align = 'left',
  style,
  numberOfLines,
}: TypographyProps) {
  const textStyle = [
    getTypography(variant),
    { color, textAlign: align },
    style,
  ];

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

// Convenience components
export function Heading1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h1" />;
}

export function Heading2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h2" />;
}

export function Heading3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h3" />;
}

export function Heading4(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h4" />;
}

export function Body1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="body1" />;
}

export function Body2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="body2" />;
}

export function Caption(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="caption" />;
}
