import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text, TextInput, Card, HelperText, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCreateIssueMutation } from '../../hooks/useIssues';
import { PrimaryButton } from '../../components/UI/PrimaryButton';
import { AIAnalysisCard } from '../../components/AIAnalysisCard';
import { Issue } from '../../types/models';
import { COLORS, THEME } from '../../config/constants';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function ReportIssueScreen() {
  const router = useRouter(); const { token } = useAuth();
  const [description, setDescription] = useState(''); const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState('');

  // Form State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // AI Processing State indicator
  const [aiProcessingStage, setAiProcessingStage] = useState<string>('Preparing report...');
  const [createdIssue, setCreatedIssue] = useState<Issue | null>(null);

  const createIssueMutation = useCreateIssueMutation();

  // Fetch current GPS location
  const fetchCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please allow location access in settings.');
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;
      let addressString = '';

      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode && reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          const parts = [place.street, place.district || place.city, place.postalCode].filter(Boolean);
          addressString = parts.join(', ');
        }
      } catch (geoErr) {
        console.warn('Reverse geocoding error:', geoErr);
      }

      setLocation({
        latitude,
        longitude,
        address: addressString || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      });
    } catch (err: any) {
      console.error('Error fetching location:', err);
      setLocationError('Failed to capture GPS position. Tap retry below.');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Auto-fetch location on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

  // Open Camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setFormError('Camera permission is required to capture photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setFormError(null);
      }
    } catch (err) {
      console.error('Error opening camera:', err);
      setFormError('Could not open camera.');
    }
  };

  // Pick from Gallery
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setFormError('Gallery access permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setFormError(null);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setFormError('Could not open image gallery.');
    }
  };

  // Submit Issue
  const handleSubmit = async () => {
    // 1. Validation
    if (!imageUri) {
      setFormError('Please capture or select a photo of the issue.');
      return;
    }

    if (!location) {
      setFormError('GPS coordinates are required to pinpoint the issue.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please enter a brief description of the problem.');
      return;
    }

    setFormError(null);

    // 2. Build FormData
    const formData = new FormData();

    // Determine clean filename and MIME type
    const rawExtension = imageUri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const cleanExtension = rawExtension === 'png' ? 'png' : 'jpg';
    const mimeType = cleanExtension === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `issue_${Date.now()}.${cleanExtension}`;

    if (Platform.OS === 'web') {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, fileName);
      } catch (blobErr) {
        console.warn('Web blob conversion error:', blobErr);
        formData.append('image', {
          uri: imageUri,
          name: fileName,
          type: mimeType,
        } as any);
      }
    } else {
      formData.append('image', {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    formData.append('description', description.trim());
    formData.append('latitude', String(location.latitude));
    formData.append('longitude', String(location.longitude));


    // 3. AI pipeline animation stages
    setAiProcessingStage('Analyzing image');
    const stageTimer1 = setTimeout(() => {
      setAiProcessingStage('Detecting issue');
    }, 800);
    const stageTimer2 = setTimeout(() => {
      setAiProcessingStage('Checking nearby reports');
    }, 1600);
    const stageTimer3 = setTimeout(() => {
      setAiProcessingStage('Calculating priority');
    }, 2400);

    createIssueMutation.mutate(formData, {
      onSuccess: (newIssue) => {
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
        clearTimeout(stageTimer3);
        setCreatedIssue(newIssue);
      },
      onError: (error: any) => {
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
        clearTimeout(stageTimer3);
        const errMsg =
          error.response?.data?.message ||
          error.message ||
          'Failed to submit report. Please check your network and try again.';
        setFormError(errMsg);
      },
    });

  };

  const isSubmitting = createIssueMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <IconButton
          icon="arrow-left"
          iconColor={COLORS.text}
          size={24}
          onPress={() => router.back()}
          disabled={isSubmitting}
        />
        <Text variant="titleLarge" style={styles.topBarTitle}>
          Report Civic Issue
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Notice */}
          <View style={styles.noticeCard}>
            <MaterialCommunityIcons name="robot" size={22} color={COLORS.primary} />
            <Text variant="bodySmall" style={styles.noticeText}>
              NAGAR-X AI will automatically classify, determine severity, calculate SLA, and route your issue to the correct municipal department.
            </Text>
          </View>

          {formError ? (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.error} />
              <HelperText type="error" visible={!!formError} style={styles.errorText}>
                {formError}
              </HelperText>
            </View>
          ) : null}

          {/* STEP 1: Photo Evidence */}
          <Text variant="titleMedium" style={styles.sectionHeading}>
            1. Photo Evidence <Text style={styles.requiredAsterisk}>*</Text>
          </Text>

          {imageUri ? (
            <Card style={styles.imagePreviewCard} mode="contained">
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.imageActionsRow}>
                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={handleTakePhoto}
                  disabled={isSubmitting}
                >
                  <MaterialCommunityIcons name="camera-retake" size={18} color={COLORS.primary} />
                  <Text style={styles.imageActionText}>Retake Photo</Text>
                </TouchableOpacity>

                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={handlePickFromGallery}
                  disabled={isSubmitting}
                >
                  <MaterialCommunityIcons name="image-edit" size={18} color={COLORS.primary} />
                  <Text style={styles.imageActionText}>Choose Another</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <Card style={styles.photoCaptureCard} mode="outlined">
              <Card.Content style={styles.photoCardContent}>
                <View style={styles.photoIconCircle}>
                  <MaterialCommunityIcons name="camera" size={32} color={COLORS.primary} />
                </View>
                <Text variant="titleSmall" style={styles.photoTitle}>
                  Capture or Upload Photo
                </Text>
                <Text variant="bodySmall" style={styles.photoSubtitle}>
                  Clear photos help AI classify the issue accurately
                </Text>

                <View style={styles.photoButtonsRow}>
                  <PrimaryButton
                    mode="contained"
                    icon="camera"
                    onPress={handleTakePhoto}
                    disabled={isSubmitting}
                    style={styles.photoBtn}
                  >
                    Take Photo
                  </PrimaryButton>

                  <PrimaryButton
                    mode="outlined"
                    icon="image-outline"
                    onPress={handlePickFromGallery}
                    disabled={isSubmitting}
                    style={styles.photoBtn}
                  >
                    Gallery
                  </PrimaryButton>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* STEP 2: Location Pinpoint */}
          <Text variant="titleMedium" style={[styles.sectionHeading, { marginTop: THEME.padding.lg }]}>
            2. GPS Location <Text style={styles.requiredAsterisk}>*</Text>
          </Text>

          <Card style={styles.locationCard} mode="contained">
            <Card.Content style={styles.locationCardContent}>
              <View style={styles.locationRow}>
                <View
                  style={[
                    styles.locationIconBadge,
                    {
                      backgroundColor: location
                        ? COLORS.success + '15'
                        : locationError
                        ? COLORS.error + '15'
                        : COLORS.primaryLight,
                    },
                  ]}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <MaterialCommunityIcons
                      name={location ? 'map-marker-check' : locationError ? 'map-marker-alert' : 'map-marker'}
                      size={24}
                      color={location ? COLORS.success : locationError ? COLORS.error : COLORS.primary}
                    />
                  )}
                </View>

                <View style={styles.locationTextGroup}>
                  {location ? (
                    <>
                      <Text variant="titleSmall" style={styles.locationTitle}>
                        Location Pinpointed
                      </Text>
                      <Text variant="bodySmall" style={styles.locationAddress} numberOfLines={2}>
                        {location.address}
                      </Text>
                      <Text variant="labelSmall" style={styles.locationCoords}>
                        Lat: {location.latitude.toFixed(5)}, Long: {location.longitude.toFixed(5)}
                      </Text>
                    </>
                  ) : locationLoading ? (
                    <Text variant="bodyMedium" style={styles.locationLoadingText}>
                      Acquiring GPS satellite position...
                    </Text>
                  ) : (
                    <>
                      <Text variant="titleSmall" style={[styles.locationTitle, { color: COLORS.error }]}>
                        GPS Unavailable
                      </Text>
                      <Text variant="bodySmall" style={styles.locationAddress}>
                        {locationError || 'Unable to capture location coordinates.'}
                      </Text>
                    </>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.refreshLocButton}
                  onPress={fetchCurrentLocation}
                  disabled={locationLoading || isSubmitting}
                >
                  <MaterialCommunityIcons name="crosshairs-gps" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          {/* STEP 3: Description */}
          <Text variant="titleMedium" style={[styles.sectionHeading, { marginTop: THEME.padding.lg }]}>
            3. Issue Description <Text style={styles.requiredAsterisk}>*</Text>
          </Text>

          <TextInput
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (formError) setFormError(null);
            }}
            placeholder="Describe the problem (e.g., Large pothole causing traffic slowdown near market, or Water pipeline burst on footpath)..."
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
            outlineStyle={styles.descriptionOutline}
            activeOutlineColor={COLORS.primary}
            disabled={isSubmitting}
          />
          <Text variant="labelSmall" style={styles.charCount}>
            {description.length} characters
          </Text>

      {/* STEP 4: Submit Button */}
          <PrimaryButton
            mode="contained"
            icon="send"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            SUBMIT CIVIC REPORT
          </PrimaryButton>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* AI Processing Modal Overlay */}
      {isSubmitting ? (
        <View style={styles.aiOverlay}>
          <View style={styles.aiModalCard}>
            <View style={styles.aiIconPulse}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
            <Text variant="titleMedium" style={styles.aiModalTitle}>
              Understanding your report...
            </Text>
            <Text variant="bodyMedium" style={styles.aiModalStageText}>
              {aiProcessingStage}
            </Text>
            <View style={styles.aiPill}>
              <MaterialCommunityIcons name="robot" size={14} color={COLORS.primary} />
              <Text style={styles.aiPillText}>Automated AI Classification & SLA Assignment</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* AI Analysis Result Modal */}
      {createdIssue ? (
        <View style={styles.aiOverlay}>
          <View style={styles.aiResultModalCard}>
            <View style={styles.resultHeader}>
              <View style={styles.successCheckBadge}>
                <MaterialCommunityIcons name="check-bold" size={20} color="#FFFFFF" />
              </View>
              <Text variant="titleLarge" style={styles.resultTitle}>
                Issue Analyzed & Filed
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <AIAnalysisCard issue={createdIssue} />
            </ScrollView>

            <PrimaryButton
              mode="contained"
              icon="arrow-right"
              onPress={() => router.replace(`/issues/${createdIssue.id}` as any)}
              style={styles.viewDetailsBtn}
            >
              VIEW ISSUE DETAILS
            </PrimaryButton>
          </View>
        </View>
      ) : null}

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
    paddingHorizontal: THEME.padding.xs,
    paddingVertical: THEME.padding.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: THEME.padding.xs,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.padding.md,
    paddingBottom: THEME.padding.xl * 2,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: THEME.padding.sm,
    borderRadius: THEME.roundness,
    marginBottom: THEME.padding.md,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  noticeText: {
    flex: 1,
    color: COLORS.primaryDark,
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: THEME.padding.sm,
    borderRadius: THEME.roundness,
    marginBottom: THEME.padding.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    margin: 0,
    padding: 0,
    flex: 1,
  },
  sectionHeading: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: THEME.padding.sm,
  },
  requiredAsterisk: {
    color: COLORS.error,
  },
  photoCaptureCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.25,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  photoCardContent: {
    alignItems: 'center',
    paddingVertical: THEME.padding.lg,
  },
  photoIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.padding.sm,
  },
  photoTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  photoSubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: THEME.padding.md,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBtn: {
    minWidth: 130,
  },
  imagePreviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.25,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  imageActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.padding.sm,
    backgroundColor: COLORS.surface,
  },
  imageActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  imageActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  locationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationCardContent: {
    padding: THEME.padding.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.padding.sm,
  },
  locationTextGroup: {
    flex: 1,
  },
  locationTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  locationAddress: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationCoords: {
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationLoadingText: {
    color: COLORS.textSecondary,
  },
  refreshLocButton: {
    padding: THEME.padding.xs,
    marginLeft: THEME.padding.xs,
  },
  descriptionInput: {
    backgroundColor: COLORS.surface,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  descriptionOutline: {
    borderRadius: THEME.roundness,
    borderColor: COLORS.border,
  },
  charCount: {
    textAlign: 'right',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  submitButton: {
    marginTop: THEME.padding.lg,
    paddingVertical: 6,
    borderRadius: THEME.roundness * 1.2,
  },
  aiOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.padding.xl,
    zIndex: 999,
  },
  aiModalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.5,
    padding: THEME.padding.xl,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  aiIconPulse: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.padding.md,
  },
  aiModalTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: THEME.padding.xs,
  },
  aiModalStageText: {
    color: COLORS.primaryDark,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: THEME.padding.md,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiPillText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  aiResultModalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.5,
    padding: THEME.padding.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: THEME.padding.md,
  },
  successCheckBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewDetailsBtn: {
    marginTop: THEME.padding.md,
    borderRadius: THEME.roundness,
  },
});

