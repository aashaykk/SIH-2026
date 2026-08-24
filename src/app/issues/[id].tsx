import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '../../config/constants';

export default function IssueDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Issue Details</Text>
        <Text variant="bodyLarge" style={styles.idText}>ID Reference: #{id}</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          This screen will host the resolution progress timeline, staff details, and citizen verification controls.
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
  },
  idText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginVertical: THEME.padding.sm,
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
