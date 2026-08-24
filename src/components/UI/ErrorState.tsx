import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { PrimaryButton } from './PrimaryButton';
import { COLORS, THEME } from '../../config/constants';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not fetch the information. Please check your internet connection.',
  onRetry,
  retryText = 'Try Again',
}) => {
  return (
    <View style={styles.container}>
      <IconButton
        icon="alert-circle-outline"
        iconColor={COLORS.error}
        size={54}
        style={styles.icon}
      />
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <PrimaryButton 
          onPress={onRetry} 
          icon="refresh" 
          style={styles.button}
        >
          {retryText}
        </PrimaryButton>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.padding.xl,
    backgroundColor: COLORS.background,
  },
  icon: {
    marginBottom: THEME.padding.sm,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: THEME.padding.xs,
    marginBottom: THEME.padding.lg,
    paddingHorizontal: THEME.padding.md,
  },
  button: {
    width: '60%',
  },
});
