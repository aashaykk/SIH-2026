import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Issue } from '../types/models';
import { useVerifyIssueMutation } from '../hooks/useIssues';
import { PrimaryButton } from './UI/PrimaryButton';
import { COLORS, THEME } from '../config/constants';

interface ResolutionVerificationCardProps {
  issue: Issue;
  onVerified?: (updatedIssue: Issue) => void;
}

export const ResolutionVerificationCard: React.FC<ResolutionVerificationCardProps> = ({
  issue,
  onVerified,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const verifyMutation = useVerifyIssueMutation();

  const handleVerifyAction = (verified: boolean) => {
    if (!issue.id || verifyMutation.isPending) return;
    setErrorMessage(null);

    verifyMutation.mutate(
      { id: issue.id, verified },
      {
        onSuccess: (updatedIssue) => {
          if (onVerified) onVerified(updatedIssue);
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Failed to submit resolution verification. Please try again.';
          setErrorMessage(msg);
        },
      }
    );
  };

  const isPending = verifyMutation.isPending;

  // 1. If already VERIFIED: show Verified Success State
  if (issue.status === 'VERIFIED') {
    return (
      <Card style={styles.verifiedSuccessCard} mode="contained">
        <Card.Content style={styles.stateContent}>
          <View style={styles.iconCircleSuccess}>
            <MaterialCommunityIcons name="shield-check" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.stateTextGroup}>
            <Text variant="titleMedium" style={styles.verifiedTitle}>
              Resolution Verified
            </Text>
            <Text variant="bodySmall" style={styles.verifiedSubtitle}>
              Thank you for verifying! This civic issue has been confirmed resolved and officially closed.
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // 2. If status is REOPENED: show Reopened Alert State
  if (issue.status === 'REOPENED') {
    return (
      <Card style={styles.reopenedStateCard} mode="contained">
        <Card.Content style={styles.stateContent}>
          <View style={styles.iconCircleReopened}>
            <MaterialCommunityIcons name="alert-circle" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.stateTextGroup}>
            <Text variant="titleMedium" style={styles.reopenedTitle}>
              Issue Reopened for Revision
            </Text>
            <Text variant="bodySmall" style={styles.reopenedSubtitle}>
              You reported this issue as not fixed. Municipal teams have been alerted to re-inspect and resolve the spot.
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // 3. Only show active action prompt if status is RESOLVED
  if (issue.status !== 'RESOLVED') {
    return null;
  }

  return (
    <Card style={styles.card} mode="contained">
      <Card.Content style={styles.cardContent}>
        {/* Header Question */}
        <View style={styles.headerRow}>
          <View style={styles.questionIconBadge}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.headerTextGroup}>
            <Text variant="titleMedium" style={styles.questionTitle}>
              Was this issue actually resolved?
            </Text>
            <Text variant="bodySmall" style={styles.questionSubtitle}>
              Municipal workers have marked this civic report as fixed. Please confirm the resolution.
            </Text>
          </View>
        </View>

        {/* Error message banner if verification fails */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.error} />
            <HelperText type="error" visible={!!errorMessage} style={styles.errorText}>
              {errorMessage}
            </HelperText>
          </View>
        ) : null}

        {/* Action Buttons: YES, RESOLVED & NOT RESOLVED */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            mode="contained"
            icon="check-circle"
            onPress={() => handleVerifyAction(true)}
            loading={isPending}
            disabled={isPending}
            style={styles.yesButton}
          >
            YES, RESOLVED
          </PrimaryButton>

          <PrimaryButton
            mode="outlined"
            icon="close-circle-outline"
            onPress={() => handleVerifyAction(false)}
            loading={isPending}
            disabled={isPending}
            style={styles.noButton}
            textColor={COLORS.error}
          >
            NOT RESOLVED
          </PrimaryButton>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0FDF4',
    borderRadius: THEME.roundness * 1.5,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: THEME.padding.md,
    elevation: 2,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardContent: {
    padding: THEME.padding.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: THEME.padding.md,
  },
  questionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.padding.sm,
  },
  headerTextGroup: {
    flex: 1,
  },
  questionTitle: {
    fontWeight: 'bold',
    color: '#166534',
    fontSize: 16,
  },
  questionSubtitle: {
    color: '#15803D',
    marginTop: 2,
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: THEME.padding.xs,
    borderRadius: THEME.roundness,
    marginBottom: THEME.padding.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    padding: 0,
    margin: 0,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  yesButton: {
    backgroundColor: COLORS.success,
    borderRadius: THEME.roundness,
  },
  noButton: {
    borderColor: COLORS.error,
    borderRadius: THEME.roundness,
  },
  verifiedSuccessCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: THEME.roundness * 1.5,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginBottom: THEME.padding.md,
  },
  reopenedStateCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: THEME.roundness * 1.5,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    marginBottom: THEME.padding.md,
  },
  stateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.padding.md,
  },
  iconCircleSuccess: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.padding.sm,
  },
  iconCircleReopened: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.padding.sm,
  },
  stateTextGroup: {
    flex: 1,
  },
  verifiedTitle: {
    fontWeight: 'bold',
    color: '#166534',
  },
  verifiedSubtitle: {
    color: '#15803D',
    marginTop: 2,
    lineHeight: 16,
  },
  reopenedTitle: {
    fontWeight: 'bold',
    color: '#991B1B',
  },
  reopenedSubtitle: {
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 16,
  },
});

export default ResolutionVerificationCard;
