export const typography = {
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  styles: {
    h1: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 30,
      lineHeight: 38,
      fontWeight: '700',
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600',
    },
    h4: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600',
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    },
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
    },
    overline: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
  },
} as const; 