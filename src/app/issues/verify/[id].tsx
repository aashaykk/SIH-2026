import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { Text, Card, Avatar, Surface, SegmentedButtons, ProgressBar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getIncidentById } from '../../../services/incidents.api';
import { getResolutionDetails } from '../../../services/resolution.api';
import { LoadingState } from '../../../components/UI/LoadingState';
import { ErrorState } from '../../../components/UI/ErrorState';
import { COLORS, THEME } from '../../../config/constants';

const { width } = Dimensions.get('window');

export default function ResolutionVerificationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [photoMode, setPhotoMode] = useState<'sideBySide' | 'toggle'>('sideBySide');
  const [activeToggleTab, setActiveToggleTab] = useState<'before' | 'after'>('after');

  const incidentQuery = useQuery({
    queryKey: ['incident', id],
    queryFn: () => getIncidentById(id as string),
    enabled: Boolean(id),
  });

  const resolutionQuery = useQuery({
    queryKey: ['resolution', id],
    queryFn: () => getResolutionDetails(id as string),
    enabled: Boolean(id),
  });

  const isLoading = incidentQuery.isLoading || resolutionQuery.isLoading;
  const isError = incidentQuery.isError || resolutionQuery.isError;
  const resolution = resolutionQuery.data;
  const incident = incidentQuery.data;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading resolution verification details..." />
      </SafeAreaView>
    );
  }

  if (isError || !resolution) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Resolution Data Unavailable"
          message="Could not retrieve the resolution proof for this incident."
          onRetry={() => {
            incidentQuery.refetch();
            resolutionQuery.refetch();
          }}
        />
      </SafeAreaView>
    );
  }

  const isManualReview =
    resolution.verificationStatus === 'manual_review' ||
    resolution.verificationStatus === 'low_confidence' ||
    resolution.aiConfidence < 70;

  const confidenceScoreDecimal = resolution.aiConfidence / 100;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </Pressable>
        <Text variant="titleMedium" style={styles.topBarTitle}>
          Resolution Verification
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Incident Summary Bar */}
        <Surface style={styles.incidentHeader} elevation={0}>
          <Text variant="titleSmall" style={styles.incidentTitle}>
            {incident?.title || `Incident #${id}`}
          </Text>
          <Text variant="bodySmall" style={styles.incidentSub}>
            Ward: {incident?.ward || 'Municipal Ward'} • Dept: {incident?.department || 'Civic Dept'}
          </Text>
        </Surface>

        {/* Photo Mode Selector */}
        <View style={styles.modeSection}>
          <SegmentedButtons
            value={photoMode}
            onValueChange={(val) => setPhotoMode(val as 'sideBySide' | 'toggle')}
            buttons={[
              { value: 'sideBySide', label: 'Side-by-Side' },
              { value: 'toggle', label: 'Single View Toggle' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Photo Comparison Section */}
        <View style={styles.sectionContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Before & After Comparison
          </Text>

          {photoMode === 'sideBySide' ? (
            <View style={styles.sideBySideRow}>
              {/* Before Image */}
              <View style={styles.sideImageWrapper}>
                <Image
                  source={{ uri: resolution.beforeImage }}
                  style={styles.sideImage}
                  resizeMode="cover"
                />
                <View style={[styles.imageTag, { backgroundColor: COLORS.error }]}>
                  <Text style={styles.imageTagText}>BEFORE</Text>
                </View>
              </View>

              {/* After Image */}
              <View style={styles.sideImageWrapper}>
                <Image
                  source={{ uri: resolution.afterImage }}
                  style={styles.sideImage}
                  resizeMode="cover"
                />
                <View style={[styles.imageTag, { backgroundColor: COLORS.success }]}>
                  <Text style={styles.imageTagText}>AFTER</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.singleViewWrapper}>
              <View style={styles.toggleTabBar}>
                <Pressable
                  style={[
                    styles.toggleTab,
                    activeToggleTab === 'before' && styles.activeToggleTabBefore,
                  ]}
                  onPress={() => setActiveToggleTab('before')}
                >
                  <Text
                    style={[
                      styles.toggleTabText,
                      activeToggleTab === 'before' && styles.activeToggleTabText,
                    ]}
                  >
                    Original Report (Before)
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.toggleTab,
                    activeToggleTab === 'after' && styles.activeToggleTabAfter,
                  ]}
                  onPress={() => setActiveToggleTab('after')}
                >
                  <Text
                    style={[
                      styles.toggleTabText,
                      activeToggleTab === 'after' && styles.activeToggleTabText,
                    ]}
                  >
                    Resolved Work (After)
                  </Text>
                </Pressable>
              </View>

              <Image
                source={{
                  uri:
                    activeToggleTab === 'before'
                      ? resolution.beforeImage
                      : resolution.afterImage,
                }}
                style={styles.fullToggleImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* AI Confidence vs Manual Review Banner */}
        <View style={styles.sectionContainer}>
          {isManualReview ? (
            /* MANUAL REVIEW REQUIRED BANNER */
            <Surface style={styles.manualReviewBanner} elevation={0}>
              <View style={styles.bannerHeader}>
                <MaterialCommunityIcons
                  name="alert-decagram-outline"
                  size={28}
                  color={COLORS.warning}
                />
                <View style={styles.bannerTextGroup}>
                  <Text variant="titleMedium" style={styles.manualReviewTitle}>
                    Manual Review Required
                  </Text>
                  <Text variant="bodySmall" style={styles.manualReviewSub}>
                    Incident will remain open pending officer inspection.
                  </Text>
                </View>
              </View>

              <Text variant="bodyMedium" style={styles.manualReviewMessage}>
                The AI confidence score ({resolution.aiConfidence}%) is below automated threshold or has been flagged for manual verification. A municipal inspector will physically inspect the site.
              </Text>
            </Surface>
          ) : (
            /* PROMINENT AI CONFIDENCE DISPLAY */
            <Surface style={styles.confidenceCard} elevation={0}>
              <View style={styles.confidenceHeader}>
                <Avatar.Icon
                  size={44}
                  icon="robot-outline"
                  style={{ backgroundColor: COLORS.primaryLight }}
                  color={COLORS.primary}
                />
                <View style={styles.confidenceTitleGroup}>
                  <Text variant="titleLarge" style={styles.confidencePercentage}>
                    {resolution.aiConfidence}% AI Confidence
                  </Text>
                  <Text variant="bodySmall" style={styles.confidenceSub}>
                    Automated Vision Verification Passed
                  </Text>
                </View>
              </View>

              <ProgressBar
                progress={confidenceScoreDecimal}
                color={COLORS.success}
                style={styles.progressBar}
              />
            </Surface>
          )}
        </View>

        {/* Verification Reasons Audit List */}
        {resolution.verificationReasons && resolution.verificationReasons.length > 0 ? (
          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Verification Checklist & Audit Trail
            </Text>

            <Card mode="outlined" style={styles.reasonsCard}>
              <Card.Content style={styles.reasonsContent}>
                {resolution.verificationReasons.map((reason, idx) => (
                  <View key={`reason-${idx}`} style={styles.reasonRow}>
                    <Avatar.Icon
                      size={24}
                      icon="check-bold"
                      style={{ backgroundColor: COLORS.success + '20' }}
                      color={COLORS.success}
                    />
                    <Text variant="bodyMedium" style={styles.reasonText}>
                      {reason}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </View>
        ) : null}
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
  incidentHeader: {
    padding: THEME.padding.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  incidentTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  incidentSub: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modeSection: {
    paddingHorizontal: THEME.padding.md,
    paddingTop: THEME.padding.md,
  },
  segmentedButtons: {
    backgroundColor: COLORS.surface,
  },
  sectionContainer: {
    paddingHorizontal: THEME.padding.md,
    paddingTop: THEME.padding.md,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: THEME.padding.sm,
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sideImageWrapper: {
    flex: 1,
    height: 180,
    borderRadius: THEME.roundness,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },
  imageTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageTagText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  singleViewWrapper: {
    borderRadius: THEME.roundness,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: THEME.padding.sm,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  activeToggleTabBefore: {
    backgroundColor: COLORS.error + '15',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.error,
  },
  activeToggleTabAfter: {
    backgroundColor: COLORS.success + '15',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.success,
  },
  toggleTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeToggleTabText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  fullToggleImage: {
    width: '100%',
    height: 240,
  },
  confidenceCard: {
    padding: THEME.padding.md,
    borderRadius: THEME.roundness,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.padding.md,
  },
  confidenceTitleGroup: {
    marginLeft: THEME.padding.md,
    flex: 1,
  },
  confidencePercentage: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  confidenceSub: {
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  manualReviewBanner: {
    padding: THEME.padding.md,
    borderRadius: THEME.roundness,
    backgroundColor: '#FFFBEB', // Amber light tint
    borderWidth: 1.5,
    borderColor: COLORS.warning + '60',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.padding.xs,
  },
  bannerTextGroup: {
    marginLeft: THEME.padding.sm,
    flex: 1,
  },
  manualReviewTitle: {
    fontWeight: 'bold',
    color: '#92400E',
  },
  manualReviewSub: {
    color: '#B45309',
  },
  manualReviewMessage: {
    color: '#78350F',
    marginTop: THEME.padding.xs,
    lineHeight: 20,
  },
  reasonsCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: THEME.roundness,
  },
  reasonsContent: {
    padding: THEME.padding.md,
    gap: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonText: {
    marginLeft: THEME.padding.md,
    color: COLORS.text,
    flex: 1,
  },
});
