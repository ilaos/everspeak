// Everspeak Design System - Dark Theme
export const Colors = {
  // Primary background - deep dark blue/purple
  background: '#1a1a2e',
  backgroundLight: '#252545',
  backgroundCard: '#16213e',

  // Accent colors - soft purple/blue gradient tones
  primary: '#6a5acd',
  primaryLight: '#8b7ff5',
  primaryDark: '#5847b3',

  // Text colors
  text: '#e0e0e0',
  textSecondary: '#a0a0a0',
  textMuted: '#707070',

  // UI elements
  border: '#3a3a5c',
  borderLight: '#4a4a6c',

  // Status colors
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',

  // Special UI
  overlay: 'rgba(0, 0, 0, 0.7)',
  fog: 'rgba(255, 255, 255, 0.05)',

  // Semantic colors
  conversation: '#6a5acd',
  journal: '#8b7ff5',
  memory: '#7b68ee',
  persona: '#9370db',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};
