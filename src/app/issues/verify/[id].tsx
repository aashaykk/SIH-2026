import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable, TextInput } from 'react-native';
import { Text, Card, Avatar, Surface, SegmentedButtons, ProgressBar, Button, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getIncidentById, reopenIncident } from '../../../services/incidents.api';
import { getResolutionDetails, submitCitizenVerification } from '../../../services/resolution.api';
import { IncidentStatus } from '../../../types/models';
import { LoadingState } from '../../../components/UI/LoadingState';
import { ErrorState } from '../../../components/UI/ErrorState';
import { COLORS, THEME } from '../../../config/constants';

// Zod schema for reopening form
const reopenSchema = z.object({
  reason: z.string().min(5, 'Please provide at least 5 characters explaining why the issue is not resolved.'),
  photoUri: z.string().optional(),
});

type ReopenFormData = z.infer<typeof reopenSchema>;

export default function ResolutionVerificationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [photoMode, setPhotoMode] = useState<'sideBySide' | 'toggle'>('sideBySide');
  const [activeToggleTab, setActiveToggleTab] = useState<'before' | 'after'>('after');
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [submittedState, setSubmittedState] = useState<IncidentStatus | null>(null);

  // React Hook Form for reopening form validation
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReopenFormData>({
    resolver: zodResolver(reopenSchema),
    defaultValues: {
      reason: '',
      photoUri: '',
    },
  });

  const selectedPhotoUri = watch('photoUri');

  // Fetch incident and resolution details
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

  // Citizen verification submission mutation
  const verifyMutation = useMutation({
    mutationFn: async ({
      choice,
      reason,
      photoUri,
    }: {
      choice: 'YES' | 'PARTIAL' | 'NO';
      reason?: string;
      photoUri?: string;
    }) => {
      const res = await submitCitizenVerification(id as string, choice, reason);
      if (choice === 'NO' && reason) {
        await reopenIncident(id as string, reason, photoUri);
      }
      return res;
    },
    onSuccess: (data) => {
      setSubmittedState(data.newStatus);
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['resolution', id] });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
  });

  const handlePickPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required to attach proof photo!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setValue('photoUri', result.assets[0].uri, { shouldValidate: true });
    }
  };

  const handleFeedbackChoice = (choice: 'YES' | 'PARTIAL') => {
    setShowReopenForm(false);
    verifyMutation.mutate({ choice });
  };

  const onReopenFormSubmit = (data: ReopenFormData) => {
    verifyMutation.mutate({
      choice: 'NO',
      reason: data.reason,
      photoUri: data.photoUri,
    });
  };

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
          message="Could not retrieve resolution proof for this incident."
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

  const currentStatus = submittedState || incident?.status || 'VERIFICATION_REQUIRED';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Top Header */}
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
        {/* Incident Summary Header */}
        <Surface style={styles.incidentHeader} elevation={0}>
          <Text variant="titleSmall" style={styles.incidentTitle}>
            {incident?.title || `Incident #${id}`}
          </Text>
          <Text variant="bodySmall" style={styles.incidentSub}>
            Ward: {incident?.ward || 'Municipal Ward'} • Dept: {incident?.department || 'Civic Dept'}
          </Text>
        </Surface>

        {/* Dynamic Confirmation Banner when user submits feedback */}
        {currentStatus === 'CLOSED' ? (
          <Surface style={[styles.confirmationCard, { borderColor: COLORS.success }]} elevation={0}>
            <Avatar.Icon
              size={48}
              icon="check-circle"
              style={{ backgroundColor: COLORS.success + '20' }}
              color={COLORS.success}
            />
            <Text variant="titleMedium" style={[styles.confirmationTitle, { color: COLORS.success }]}>
              Incident Verified & Closed
            </Text>
            <Text variant="bodySmall" style={styles.confirmationSub}>
              Thank you for confirming! Your feedback helps maintain civic accountability in your municipality.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.replace('/(tabs)/my-reports' as any)}
              style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
            >
              Back to My Reports
            </Button>
          </Surface>
        ) : currentStatus === 'REVIEW_REQUIRED' ? (
          <Surface style={[styles.confirmationCard, { borderColor: COLORS.warning }]} elevation={0}>
            <Avatar.Icon
              size={48}
              icon="alert-circle"
              style={{ backgroundColor: COLORS.warning + '20' }}
              color={COLORS.warning}
            />
            <Text variant="titleMedium" style={[styles.confirmationTitle, { color: COLORS.warning }]}>
              Sent for Officer Review
            </Text>
            <Text variant="bodySmall" style={styles.confirmationSub}>
              Your partial resolution feedback has been logged. A municipal department supervisor will inspect the remaining work.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.replace('/(tabs)/my-reports' as any)}
              style={[styles.actionBtn, { backgroundColor: COLORS.warning }]}
            >
              Back to My Reports
            </Button>
          </Surface>
        ) : currentStatus === 'REOPENED' ? (
          <Surface style={[styles.confirmationCard, { borderColor: COLORS.error }]} elevation={0}>
            <Avatar.Icon
              size={48}
              icon="alert-decagram"
              style={{ backgroundColor: COLORS.error + '20' }}
              color={COLORS.error}
            />
            <Text variant="titleMedium" style={[styles.confirmationTitle, { color: COLORS.error }]}>
              Incident Reopened & Escalated
            </Text>
            <Text variant="bodySmall" style={styles.confirmationSub}>
              Your reopening request has been dispatched back to the department worker with priority escalation.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.replace('/(tabs)/my-reports' as any)}
              style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
            >
              Back to My Reports
            </Button>
          </Surface>
        ) : null}

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
            Before & After Proof Photos
          </Text>

          {photoMode === 'sideBySide' ? (
            <View style={styles.sideBySideRow}>
              {/* Before Image */}
              <View style={styles.sideImageWrapper}>
                <Image source={{ uri: resolution.beforeImage }} style={styles.sideImage} resizeMode="cover" />
                <View style={[styles.imageTag, { backgroundColor: COLORS.error }]}>
                  <Text style={styles.imageTagText}>BEFORE</Text>
                </View>
              </View>

              {/* After Image */}
              <View style={styles.sideImageWrapper}>
                <Image source={{ uri: resolution.afterImage }} style={styles.sideImage} resizeMode="cover" />
                <View style={[styles.imageTag, { backgroundColor: COLORS.success }]}>
                  <Text style={styles.imageTagText}>AFTER</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.singleViewWrapper}>
              <View style={styles.toggleTabBar}>
                <Pressable
                  style={[styles.toggleTab, activeToggleTab === 'before' && styles.activeToggleTabBefore]}
                  onPress={() => setActiveToggleTab('before')}
                >
                  <Text style={[styles.toggleTabText, activeToggleTab === 'before' && styles.activeToggleTabText]}>
                    Original Report (Before)
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleTab, activeToggleTab === 'after' && styles.activeToggleTabAfter]}
                  onPress={() => setActiveToggleTab('after')}
                >
                  <Text style={[styles.toggleTabText, activeToggleTab === 'after' && styles.activeToggleTabText]}>
                    Resolved Work (After)
                  </Text>
                </Pressable>
              </View>

              <Image
                source={{
                  uri: activeToggleTab === 'before' ? resolution.beforeImage : resolution.afterImage,
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
            <Surface style={styles.manualReviewBanner} elevation={0}>
              <View style={styles.bannerHeader}>
                <MaterialCommunityIcons name="alert-decagram-outline" size={28} color={COLORS.warning} />
                <View style={styles.bannerTextGroup}>
                  <Text variant="titleMedium" style={styles.manualReviewTitle}>
                    Manual Review Required
                  </Text>
                  <Text variant="bodySmall" style={styles.manualReviewSub}>
                    Incident stays open pending officer inspection.
                  </Text>
                </View>
              </View>
              <Text variant="bodyMedium" style={styles.manualReviewMessage}>
                The AI confidence score ({resolution.aiConfidence}%) requires manual officer verification. A municipal inspector will physically inspect the site.
              </Text>
            </Surface>
          ) : (
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
                progress={resolution.aiConfidence / 100}
                color={COLORS.success}
                style={styles.progressBar}
              />
            </Surface>
          )}
        </View>

        {/* Verification Reasons Checklist */}
        {resolution.verificationReasons && resolution.verificationReasons.length > 0 ? (
          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              AI Verification Checklist
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

        {/* CITIZEN FEEDBACK ACTION SECTION */}
        {!submittedState ? (
          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Citizen Verification Feedback
            </Text>
            <Text variant="bodySmall" style={styles.sectionSub}>
              Does the after photo match actual ground completion? Choose your response:
            </Text>

            <View style={styles.feedbackBtnGroup}>
              {/* YES RESOLVED BUTTON */}
              <Button
                mode="contained"
                icon="check-circle-outline"
                onPress={() => handleFeedbackChoice('YES')}
                loading={verifyMutation.isPending}
                style={[styles.feedbackButton, { backgroundColor: COLORS.success }]}
                contentStyle={styles.feedbackBtnContent}
              >
                Yes, Resolved
              </Button>

              {/* PARTIALLY RESOLVED BUTTON */}
              <Button
                mode="contained"
                icon="alert-circle-outline"
                onPress={() => handleFeedbackChoice('PARTIAL')}
                loading={verifyMutation.isPending}
                style={[styles.feedbackButton, { backgroundColor: COLORS.warning }]}
                contentStyle={styles.feedbackBtnContent}
              >
                Partially Resolved
              </Button>

              {/* NOT RESOLVED BUTTON */}
              <Button
                mode="contained"
                icon="close-circle-outline"
                onPress={() => setShowReopenForm(!showReopenForm)}
                style={[styles.feedbackButton, { backgroundColor: COLORS.error }]}
                contentStyle={styles.feedbackBtnContent}
              >
                Not Resolved (Reopen)
              </Button>
            </View>

            {/* REOPEN FORM (React Hook Form + Zod) */}
            {showReopenForm ? (
              <Surface style={styles.reopenFormCard} elevation={0}>
                <Text variant="titleSmall" style={styles.reopenTitle}>
                  Reopen Incident Form
                </Text>
                <Text variant="bodySmall" style={styles.reopenSub}>
                  Please explain why the issue was not resolved so field workers can re-fix it.
                </Text>

                {/* Reason Text Input */}
                <Controller
                  control={control}
                  name="reason"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.textAreaInput, errors.reason && styles.inputErrorBorder]}
                      placeholder="Explain what work remains incomplete..."
                      placeholderTextColor={COLORS.placeholder}
                      multiline
                      numberOfLines={4}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.reason ? (
                  <HelperText type="error" visible={Boolean(errors.reason)}>
                    {errors.reason.message}
                  </HelperText>
                ) : null}

                {/* Optional Photo Attachment */}
                <View style={styles.photoSection}>
                  <Button
                    mode="outlined"
                    icon="camera-outline"
                    onPress={handlePickPhoto}
                    style={styles.photoPickBtn}
                    textColor={COLORS.primary}
                  >
                    {selectedPhotoUri ? 'Change Photo' : 'Attach Proof Photo (Optional)'}
                  </Button>

                  {selectedPhotoUri ? (
                    <View style={styles.previewImageWrapper}>
                      <Image source={{ uri: selectedPhotoUri }} style={styles.previewImage} />
                      <Pressable
                        style={styles.removePhotoBadge}
                        onPress={() => setValue('photoUri', '', { shouldValidate: true })}
                      >
                        <MaterialCommunityIcons name="close" size={14} color="#FFF" />
                      </Pressable>
                    </View>
                  ) : null}
                </View>

                {/* Submit Reopen Request */}
                <Button
                  mode="contained"
                  icon="send-outline"
                  onPress={handleSubmit(onReopenFormSubmit)}
                  loading={verifyMutation.isPending}
                  style={[styles.actionBtn, { backgroundColor: COLORS.error, marginTop: THEME.padding.sm }]}
                >
                  Submit Reopen Request
                </Button>
              </Surface>
            ) : null}
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
  confirmationCard: {
    margin: THEME.padding.md,
    padding: THEME.padding.md,
    borderRadius: THEME.roundness,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontWeight: 'bold',
    marginTop: THEME.padding.xs,
  },
  confirmationSub: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: THEME.padding.md,
  },
  actionBtn: {
    borderRadius: THEME.roundness,
    width: '100%',
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
  },
  sectionSub: {
    color: COLORS.textSecondary,
    marginBottom: THEME.padding.sm,
    marginTop: 2,
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
    backgroundColor: '#FFFBEB',
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
  feedbackBtnGroup: {
    gap: 10,
    marginVertical: THEME.padding.sm,
  },
  feedbackButton: {
    borderRadius: THEME.roundness,
  },
  feedbackBtnContent: {
    paddingVertical: 6,
  },
  reopenFormCard: {
    padding: THEME.padding.md,
    borderRadius: THEME.roundness,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.error + '40',
    marginTop: THEME.padding.sm,
  },
  reopenTitle: {
    fontWeight: 'bold',
    color: COLORS.error,
  },
  reopenSub: {
    color: COLORS.textSecondary,
    marginBottom: THEME.padding.sm,
    marginTop: 2,
  },
  textAreaInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.roundness,
    padding: THEME.padding.sm,
    color: COLORS.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  inputErrorBorder: {
    borderColor: COLORS.error,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: THEME.padding.sm,
  },
  photoPickBtn: {
    borderColor: COLORS.primary,
    borderRadius: THEME.roundness,
  },
  previewImageWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
  },
});
