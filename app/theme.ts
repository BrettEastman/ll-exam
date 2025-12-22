import { createSystem, defaultConfig } from '@chakra-ui/react';

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e3f2fd' },
          100: { value: '#bbdefb' },
          200: { value: '#90caf9' },
          300: { value: '#64b5f6' },
          400: { value: '#42a5f5' },
          500: { value: '#2196f3' },
          600: { value: '#1e88e5' },
          700: { value: '#1976d2' },
          800: { value: '#1565c0' },
          900: { value: '#0d47a1' },
        },
        success: {
          50: { value: '#e8f5e9' },
          100: { value: '#c8e6c9' },
          500: { value: '#4caf50' },
          600: { value: '#43a047' },
          700: { value: '#388e3c' },
        },
        warning: {
          50: { value: '#fff3e0' },
          100: { value: '#ffe0b2' },
          500: { value: '#ff9800' },
          600: { value: '#fb8c00' },
        },
      },
      fonts: {
        heading: { value: 'var(--font-geist-sans), sans-serif' },
        body: { value: 'var(--font-geist-sans), sans-serif' },
      },
    },
  },
});
