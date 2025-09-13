import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35', // Saffron orange
    secondary: '#4CAF50', // Green
    accent: '#FFC107', // Amber
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#212121',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF5722',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    // Custom colors for spiritual theme
    spiritual: {
      saffron: '#FF6B35',
      lotus: '#FFB6C1',
      sacred: '#8B4513',
      divine: '#FFD700',
      peace: '#E6E6FA',
      wisdom: '#4B0082'
    }
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    }
  },
  roundness: 8,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  }
};
