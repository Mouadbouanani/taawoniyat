// Professional Design System for Taawoniyat App
export const designSystem = {
  // Brand Colors - Modern and Professional
  colors: {
    // Primary Brand Colors - Modern Blue-Green
    primary: {
      50: '#F0FDFA',   // Very light teal
      100: '#CCFBF1',  // Light teal
      200: '#99F6E4',  // Lighter teal
      300: '#5EEAD4',  // Light teal
      400: '#2DD4BF',  // Medium teal
      500: '#14B8A6',  // Primary teal
      600: '#0D9488',  // Darker teal
      700: '#0F766E',  // Dark teal
      800: '#115E59',  // Very dark teal
      900: '#134E4A',  // Darkest teal
    },

    // Secondary Colors - Warm Orange
    secondary: {
      50: '#FFF7ED',   // Very light orange
      100: '#FFEDD5',  // Light orange
      200: '#FED7AA',  // Lighter orange
      300: '#FDBA74',  // Light orange
      400: '#FB923C',  // Medium orange
      500: '#F97316',  // Primary orange
      600: '#EA580C',  // Darker orange
      700: '#C2410C',  // Dark orange
      800: '#9A3412',  // Very dark orange
      900: '#7C2D12',  // Darkest orange
    },

    // Neutral Colors
    neutral: {
      50: '#FAFAFA',   // Almost white
      100: '#F5F5F5',  // Very light gray
      200: '#E5E5E5',  // Light gray
      300: '#D4D4D4',  // Medium light gray
      400: '#A3A3A3',  // Medium gray
      500: '#737373',  // Gray
      600: '#525252',  // Dark gray
      700: '#404040',  // Very dark gray
      800: '#262626',  // Almost black
      900: '#171717',  // Black
    },

    // Semantic Colors
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },

    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },

    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },

    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
    },
  },

  // Typography System
  typography: {
    fonts: {
      primary: 'System',
      secondary: 'SpaceMono',
    },

    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
      '6xl': 48,
    },

    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing System (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Component Styles
  components: {
    button: {
      primary: {
        backgroundColor: '#14B8A6',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      secondary: {
        backgroundColor: '#F97316',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#14B8A6',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
    },

    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },

    input: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D4D4D4',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
    },

    header: {
      backgroundColor: '#14B8A6',
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },

    tabBar: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E5E5',
      paddingBottom: 8,
      height: 80,
    },
  },

  // Layout
  layout: {
    containerPadding: 16,
    sectionSpacing: 24,
    cardSpacing: 16,
  },

  // Animation
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
} as const;

// Helper functions for consistent styling
export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let result: any = designSystem.colors;

  for (const key of keys) {
    result = result[key];
    if (!result) return '#000000'; // fallback
  }

  return result;
};

export const getSpacing = (size: keyof typeof designSystem.spacing) => {
  return designSystem.spacing[size];
};

export const getTypography = (variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'button' | 'caption') => {
  const { typography } = designSystem;

  switch (variant) {
    case 'h1':
      return { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.bold, lineHeight: typography.lineHeights.tight };
    case 'h2':
      return { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.bold, lineHeight: typography.lineHeights.tight };
    case 'h3':
      return { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.semibold, lineHeight: typography.lineHeights.normal };
    case 'h4':
      return { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.semibold, lineHeight: typography.lineHeights.normal };
    case 'body1':
      return { fontSize: typography.sizes.base, fontWeight: typography.weights.regular, lineHeight: typography.lineHeights.normal };
    case 'body2':
      return { fontSize: typography.sizes.sm, fontWeight: typography.weights.regular, lineHeight: typography.lineHeights.normal };
    case 'button':
      return { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, lineHeight: typography.lineHeights.normal };
    case 'caption':
      return { fontSize: typography.sizes.xs, fontWeight: typography.weights.regular, lineHeight: typography.lineHeights.normal };
    default:
      return { fontSize: typography.sizes.base, fontWeight: typography.weights.regular, lineHeight: typography.lineHeights.normal };
  }
};
