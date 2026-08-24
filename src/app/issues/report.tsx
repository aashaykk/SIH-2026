import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '../../config/constants';

export default function ReportIssueScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Report New Issue</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          This screen will host the camera capture, location tracking, and description input form.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.padding.xl,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: THEME.padding.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: THEME.padding.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: THEME.roundness,
  },
});
