import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'flat';
}

export default function Card({
  variant = 'default',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && [styles.elevated, Shadows.md],
        variant === 'flat' && styles.flat,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    borderWidth: 0,
  },
  flat: {
    borderWidth: 0,
    backgroundColor: Colors.backgroundLight,
  },
});
