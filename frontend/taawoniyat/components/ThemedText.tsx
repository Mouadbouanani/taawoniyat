import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { typography } from '@/theme/typography';
import { colors } from '@/theme/colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: keyof typeof typography.styles;
  color?: 'primary' | 'neutral' | 'success' | 'error' | 'warning';
  weight?: keyof typeof typography.weights;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = 'body1',
  color = 'neutral',
  weight,
  align = 'left',
  ...rest
}: ThemedTextProps) {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );

  const getColorValue = () => {
    if (color === 'primary') return colors.primary[600];
    if (color === 'neutral') return colors.neutral[900];
    if (color === 'success') return colors.success[600];
    if (color === 'error') return colors.error[600];
    if (color === 'warning') return colors.warning[600];
    return textColor;
  };

  return (
    <Text
      style={[
        typography.styles[variant],
        {
          color: getColorValue(),
          textAlign: align,
          ...(weight && { fontWeight: typography.weights[weight] }),
        },
        style,
      ]}
      {...rest}
    />
  );
}

// Example usage styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 16,
  },
});
