import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, THEME } from '../../config/constants';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
  fullScreen = true,
}) => {
  return (
    <View style={[styles.container, fullScreen ? styles.fullHeight : styles.fitHeight]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text variant="bodyMedium" style={styles.text}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.padding.lg,
  },
  fullHeight: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fitHeight: {
    marginVertical: THEME.padding.xl,
  },
  text: {
    color: COLORS.textSecondary,
    marginTop: THEME.padding.md,
    textAlign: 'center',
  },
});
