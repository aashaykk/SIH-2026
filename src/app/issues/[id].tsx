import React from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Text, Card, Avatar, Chip, Surface, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getIncidentById } from '../../services/incidents.api';
import { LoadingState } from '../../components/UI/LoadingState';
import { ErrorState } from '../../components/UI/ErrorState';
import { COLORS, THEME, CIVIC_CATEGORIES, ISSUE_STATUSES } from '../../config/constants';

export default function IssueDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: incident,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => getIncidentById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading issue details..." />
      </SafeAreaView>
    );
  }

  if (isError || !incident) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Incident Not Found"
          message={
            error instanceof Error ? error.message : 'Could not find details for this incident.'
          }
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  const categoryInfo = CIVIC_CATEGORIES.find((c) => c.id === incident.category) || {
    label: 'General Civic Issue',
    icon: 'alert-circle',
    color: COLORS.primary,
  };

  const statusInfo = ISSUE_STATUSES[incident.status] || {
    label: incident.status,
    color: COLORS.primary,
    icon: 'information-outline',
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return COLORS.severityCritical;
      case 'HIGH':
        return COLORS.severityHigh;
      case 'MEDIUM':
        return COLORS.severityMedium;
      case 'LOW':
      default:
        return COLORS.severityLow;
    }
  };

  const priorityColor = getPriorityColor(incident.priority.level);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </Pressable>
        <Text variant="titleMedium" style={styles.topBarTitle} numberOfLines={1}>
          Incident #{incident.id}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Incident Image Header */}
        {incident.imageUrl ? (
          <Image
            source={{ uri: incident.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <Surface style={[styles.placeholderImage, { backgroundColor: categoryInfo.color + '15' }]}>
            <Avatar.Icon
              size={64}
              icon={categoryInfo.icon}
              style={{ backgroundColor: 'transparent' }}
              color={categoryInfo.color}
            />
          </Surface>
        )}

        <View style={styles.mainPadding}>
          {/* Header Badges */}
          <View style={styles.badgeRow}>
            {/* Category Chip */}
            <View style={[styles.chip, { backgroundColor: categoryInfo.color + '15' }]}>
              <MaterialCommunityIcons name={categoryInfo.icon as any} size={16} color={categoryInfo.color} />
              <Text style={[styles.chipText, { color: categoryInfo.color }]}>
                {categoryInfo.label}
              </Text>
            </View>

            {/* Status Chip */}
            <View style={[styles.chip, { backgroundColor: statusInfo.color + '15' }]}>
              <MaterialCommunityIcons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
              <Text style={[styles.chipText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>

            {/* Priority Chip */}
            <View style={[styles.chip, { backgroundColor: priorityColor + '15' }]}>
              <MaterialCommunityIcons name="shield-alert-outline" size={16} color={priorityColor} />
              <Text style={[styles.chipText, { color: priorityColor }]}>
                {incident.priority.level} ({incident.priority.score})
              </Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text variant="headlineSmall" style={styles.title}>
            {incident.title || `${categoryInfo.label} Issue`}
          </Text>

          {incident.description ? (
            <Text variant="bodyMedium" style={styles.description}>
              {incident.description}
            </Text>
          ) : null}

          {/* Crowdsourced Reports Count Card */}
          <Surface style={styles.reportCountCard} elevation={0}>
            <MaterialCommunityIcons name="account-group-outline" size={24} color={COLORS.primary} />
            <View style={styles.reportCountTextContainer}>
              <Text variant="titleSmall" style={styles.reportCountTitle}>
                {incident.reportsCount} {incident.reportsCount === 1 ? 'Citizen' : 'Citizens'} Reported This
              </Text>
              <Text variant="bodySmall" style={styles.reportCountSub}>
                Merged duplicate reports increase response priority.
              </Text>
            </View>
          </Surface>

          {/* Ward & Department Information */}
          <Card style={styles.infoCard} mode="outlined">
            <Card.Content style={styles.infoCardContent}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.primary} />
                <View style={styles.infoTextGroup}>
                  <Text variant="labelSmall" style={styles.infoLabel}>WARD LOCATION</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {incident.ward} {incident.locationName ? `(${incident.locationName})` : ''}
                  </Text>
                </View>
              </View>

              <Divider style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="office-building" size={20} color={COLORS.primary} />
                <View style={styles.infoTextGroup}>
                  <Text variant="labelSmall" style={styles.infoLabel}>ASSIGNED DEPARTMENT</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {incident.department}
                  </Text>
                </View>
              </View>

              {incident.slaDeadline ? (
                <>
                  <Divider style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-alert-outline" size={20} color={COLORS.warning} />
                    <View style={styles.infoTextGroup}>
                      <Text variant="labelSmall" style={styles.infoLabel}>SLA RESOLUTION DEADLINE</Text>
                      <Text variant="bodyMedium" style={[styles.infoValue, { color: COLORS.warning }]}>
                        {new Date(incident.slaDeadline).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}
            </Card.Content>
          </Card>

          {/* Placeholder for Status Timeline Component (Next Phase) */}
          <Surface style={styles.timelinePlaceholder} elevation={0}>
            <View style={styles.timelinePlaceholderHeader}>
              <MaterialCommunityIcons name="timeline-text-outline" size={22} color={COLORS.primary} />
              <Text variant="titleMedium" style={styles.timelinePlaceholderTitle}>
                Incident Progress Timeline
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.timelinePlaceholderSub}>
              [Visual Status Timeline Component will be rendered here in Phase 4]
            </Text>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.padding.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: THEME.padding.xs,
  },
  topBarTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: THEME.padding.xl * 2,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPadding: {
    padding: THEME.padding.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: THEME.padding.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: THEME.padding.xs,
  },
  description: {
    color: COLORS.textSecondary,
    marginBottom: THEME.padding.md,
    lineHeight: 20,
  },
  reportCountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.padding.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: THEME.roundness,
    marginBottom: THEME.padding.md,
  },
  reportCountTextContainer: {
    marginLeft: THEME.padding.md,
    flex: 1,
  },
  reportCountTitle: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  reportCountSub: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness,
    borderColor: COLORS.border,
    marginBottom: THEME.padding.md,
  },
  infoCardContent: {
    padding: THEME.padding.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextGroup: {
    marginLeft: THEME.padding.md,
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    fontWeight: 'bold',
    fontSize: 10,
  },
  infoValue: {
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  infoDivider: {
    marginVertical: THEME.padding.sm,
    backgroundColor: COLORS.border,
  },
  timelinePlaceholder: {
    padding: THEME.padding.md,
    borderRadius: THEME.roundness,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: THEME.padding.sm,
  },
  timelinePlaceholderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelinePlaceholderTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timelinePlaceholderSub: {
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
