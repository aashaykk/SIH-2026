import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { COLORS, THEME } from '../../config/constants';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined' | 'text';
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onPress,
  icon,
  loading = false,
  disabled = false,
  mode = 'contained',
  style,
  textColor,
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled || loading}
      style={[
        mode === 'contained' ? styles.containedButton : styles.button,
        style
      ]}
      labelStyle={styles.label}
      textColor={textColor || (mode === 'contained' ? '#FFF' : COLORS.primary)}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: THEME.roundness,
  },
  containedButton: {
    backgroundColor: COLORS.primary,
    borderRadius: THEME.roundness,
    paddingVertical: 4,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
