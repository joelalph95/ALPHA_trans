export const COLORS = {
  primary: '#1B4332',       // Vert forêt profond
  primaryLight: '#52B788',  // Vert moyen
  primaryDark: '#081C15',   // Vert très sombre
  accent: '#F97316',        // Orange coucher de soleil
  accentLight: '#FED7AA',   // Orange clair
  background: '#F5F0E8',    // Blanc cassé chaud
  card: '#FFFFFF',
  surface: '#F0EBE0',
  text: '#1A1A1A',
  textLight: '#6B7280',
  textInverse: '#FFFFFF',
  border: '#E5DDD0',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  shadow: 'rgba(27, 67, 50, 0.15)',
};

export const FONTS = {
  // Tailles
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};
