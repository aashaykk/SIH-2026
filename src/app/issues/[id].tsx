import React from 'react';
import { View, StyleSheet, ScrollView, Image, Linking, Platform } from 'react-native';
import { Text, Card, Divider, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIssueDetailsQuery } from '../../hooks/useIssues';
import { AIAnalysisCard } from '../../components/AIAnalysisCard';
import { StatusTimeline } from '../../components/StatusTimeline';
import { ResolutionVerificationCard } from '../../components/ResolutionVerificationCard';
import { PrimaryButton } from '../../components/UI/PrimaryButton';
import { LoadingState } from '../../components/UI/LoadingState';
import { ErrorState } from '../../components/UI/ErrorState';
import { COLORS, THEME, ISSUE_STATUSES } from '../../config/constants';

export default function IssueDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: issue, isLoading, isError, refetch } = useIssueDetailsQuery(id || '');

  if (isLoading) {
    return <LoadingState message="Fetching issue details..." fullScreen />;
  }

  if (isError || !issue) {
    return (
      <ErrorState
        title="Issue Not Found"
        message="Could not retrieve the details for this civic report."
        onRetry={() => refetch()}
      />
    );
  }

  const statusConfig = ISSUE_STATUSES[issue.status] || {
    label: issue.status,
    color: COLORS.info,
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const openInMaps = () => {
    if (issue.latitude && issue.longitude) {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${issue.latitude},${issue.longitude}`;
      const label = issue.title || 'Civic Issue Location';
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });
      if (url) {
        Linking.openURL(url).catch((err) => console.error('Error opening maps:', err));
      }
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <PrimaryButton
          mode="text"
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </PrimaryButton>
        <Text variant="titleMedium" style={styles.topBarTitle} numberOfLines={1}>
          Issue #{issue.id.slice(0, 8)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Photo Image Banner */}
        {issue.imageUrl ? (
          <Image
            source={{ uri: issue.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <MaterialCommunityIcons name="image-off-outline" size={44} color={COLORS.placeholder} />
            <Text variant="bodySmall" style={styles.noImageText}>
              No photo evidence uploaded
            </Text>
          </View>
        )}

        {/* 2. Visual Status Progression Timeline */}
        <StatusTimeline currentStatus={issue.status} />

        {/* 3. AI Analysis Presentation Card (Category, Confidence, Severity, Priority, Dept, SLA, Duplicate) */}
        <AIAnalysisCard issue={issue} />

        {/* 4. Incident Details & Location Card */}
        <Card style={styles.card} mode="contained">
          <Card.Content>
            <View style={styles.statusHeaderRow}>
              <Text variant="titleLarge" style={styles.title}>
                {issue.title}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: statusConfig.color + '15' }]}>
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Description */}
            <Text variant="titleSmall" style={styles.sectionHeader}>
              Report Description
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {issue.description || 'No additional description provided.'}
            </Text>

            <Divider style={styles.divider} />

            {/* Location & Metadata Grid */}
            <Text variant="titleSmall" style={styles.sectionHeader}>
              Location & Field Data
            </Text>

            <View style={styles.locationContainer}>
              <View style={styles.locationInfo}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                <View style={styles.locTextGroup}>
                  <Text variant="bodyMedium" style={styles.coordsText}>
                    {issue.latitude.toFixed(5)}, {issue.longitude.toFixed(5)}
                  </Text>
                  <Text variant="labelSmall" style={styles.coordsLabel}>
                    GPS Coordinates
                  </Text>
                </View>
              </View>
              <IconButton
                icon="map-search-outline"
                iconColor={COLORS.primary}
                size={22}
                onPress={openInMaps}
                style={styles.mapButton}
              />
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text variant="labelSmall" style={styles.infoLabel}>Date Filed</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {formatDate(issue.createdAt)}
                </Text>
              </View>

              {issue.updatedAt ? (
                <View style={styles.infoItem}>
                  <Text variant="labelSmall" style={styles.infoLabel}>Last Updated</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {formatDate(issue.updatedAt)}
                  </Text>
                </View>
              ) : null}

              {issue.assignedOfficer ? (
                <View style={styles.infoItem}>
                  <Text variant="labelSmall" style={styles.infoLabel}>Assigned Officer</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {issue.assignedOfficer.slice(0, 8)}...
                  </Text>
                </View>
              ) : null}

              {issue.reportCount ? (
                <View style={styles.infoItem}>
                  <Text variant="labelSmall" style={styles.infoLabel}>Citizen Reports</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {issue.reportCount} {issue.reportCount === 1 ? 'report' : 'reports'}
                  </Text>
                </View>
              ) : null}
            </View>
          </Card.Content>
        </Card>

        {/* 5. Citizen Resolution Verification Section */}
        <ResolutionVerificationCard
          issue={issue}
          onVerified={() => {
            refetch();
          }}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.padding.sm,
    paddingVertical: THEME.padding.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: THEME.padding.xs,
  },
  topBarTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  scrollContent: {
    padding: THEME.padding.md,
    paddingBottom: THEME.padding.xl * 2,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: THEME.roundness * 1.5,
    marginBottom: THEME.padding.md,
  },
  noImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: THEME.roundness * 1.5,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.padding.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noImageText: {
    color: COLORS.textSecondary,
    marginTop: THEME.padding.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: THEME.padding.md,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.padding.xs,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: THEME.padding.md,
  },
  sectionHeader: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: THEME.padding.xs,
  },
  description: {
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    padding: THEME.padding.sm,
    borderRadius: THEME.roundness,
    marginVertical: THEME.padding.xs,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  locTextGroup: {
    flex: 1,
  },
  coordsText: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  coordsLabel: {
    color: COLORS.textSecondary,
  },
  mapButton: {
    margin: 0,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: THEME.padding.md,
  },
  infoItem: {
    width: '46%',
  },
  infoLabel: {
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '600',
    color: COLORS.text,
  },
  verifyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: THEME.roundness * 1.5,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  verifyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.padding.md,
  },
  verifyTextGroup: {
    marginLeft: THEME.padding.sm,
    flex: 1,
  },
  verifyTitle: {
    fontWeight: 'bold',
    color: '#166534',
  },
  verifySubtitle: {
    color: '#15803D',
    marginTop: 2,
  },
  verifyActions: {
    gap: 8,
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
  },
  reopenBtn: {
    borderColor: COLORS.error,
  },
});
