import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { PrimaryButton } from './PrimaryButton';
import { COLORS, THEME } from '../../config/constants';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  onAction?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'clipboard-text-outline',
  title = 'No reports yet',
  message = 'Once you file an issue, it will appear here in list.',
  onAction,
  actionText = 'Create Report',
}) => {
  return (
    <View style={styles.container}>
      <IconButton
        icon={icon}
        iconColor={COLORS.textSecondary}
        size={64}
        style={styles.icon}
      />
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
      {onAction ? (
        <PrimaryButton 
          onPress={onAction} 
          icon="plus" 
          style={styles.button}
        >
          {actionText}
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
    opacity: 0.8,
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
