import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IssueStatus } from '../types/models';
import { COLORS, THEME } from '../config/constants';

interface StatusTimelineProps {
  currentStatus: IssueStatus;
}

interface TimelineStep {
  status: IssueStatus;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const STANDARD_STEPS: TimelineStep[] = [
  {
    status: 'REPORTED',
    label: 'Reported',
    description: 'Civic issue filed and logged in system',
    icon: 'file-document-edit-outline',
  },
  {
    status: 'ACKNOWLEDGED',
    label: 'Acknowledged',
    description: 'Reviewed by municipal ward authority',
    icon: 'account-check-outline',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    description: 'Field workers assigned and work started',
    icon: 'progress-wrench',
  },
  {
    status: 'RESOLVED',
    label: 'Resolved',
    description: 'Fix completed on-site by field team',
    icon: 'checkbox-marked-circle-outline',
  },
  {
    status: 'VERIFIED',
    label: 'Verified',
    description: 'Citizen verified resolution',
    icon: 'shield-check',
  },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus }) => {
  const isReopened = currentStatus === 'REOPENED';

  // Standard step index mapping
  const stepOrder: IssueStatus[] = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED'];
  const currentIndex = isReopened ? 2 : stepOrder.indexOf(currentStatus);

  return (
    <Card style={styles.card} mode="contained">
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>RESOLUTION TIMELINE</Text>
          <View
            style={[
              styles.currentStatusPill,
              {
                backgroundColor: isReopened
                  ? COLORS.error + '18'
                  : currentStatus === 'VERIFIED'
                  ? COLORS.success + '18'
                  : COLORS.primaryLight,
              },
            ]}
          >
            <Text
              style={[
                styles.currentStatusPillText,
                {
                  color: isReopened
                    ? COLORS.error
                    : currentStatus === 'VERIFIED'
                    ? COLORS.success
                    : COLORS.primary,
                },
              ]}
            >
              {currentStatus}
            </Text>
          </View>
        </View>

        {/* Reopened Alert Banner if applicable */}
        {isReopened ? (
          <View style={styles.reopenedBanner}>
            <MaterialCommunityIcons name="alert-decagram" size={20} color={COLORS.error} />
            <View style={styles.reopenedTextGroup}>
              <Text style={styles.reopenedTitle}>Issue Reopened</Text>
              <Text style={styles.reopenedSubtitle}>
                Citizen indicated resolution was incomplete. The report has been returned for further work.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Vertical Timeline Steps */}
        <View style={styles.timelineList}>
          {STANDARD_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = !isReopened && index === currentIndex;
            const isUpcoming = index > currentIndex;
            const isLast = index === STANDARD_STEPS.length - 1;

            return (
              <View key={step.status} style={styles.stepContainer}>
                {/* Left Column: Icon node + connecting line */}
                <View style={styles.nodeColumn}>
                  <View
                    style={[
                      styles.nodeCircle,
                      isCompleted && styles.nodeCompleted,
                      isCurrent && styles.nodeCurrent,
                      isUpcoming && styles.nodeUpcoming,
                    ]}
                  >
                    {isCompleted ? (
                      <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                    ) : isCurrent ? (
                      <View style={styles.activeDot} />
                    ) : (
                      <View style={styles.inactiveDot} />
                    )}
                  </View>

                  {!isLast ? (
                    <View
                      style={[
                        styles.connectorLine,
                        isCompleted ? styles.lineCompleted : styles.lineUpcoming,
                      ]}
                    />
                  ) : null}
                </View>

                {/* Right Column: Step Label & Description */}
                <View style={[styles.stepContent, isLast && styles.lastStepContent]}>
                  <View style={styles.stepTitleRow}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                        isCompleted && styles.stepLabelCompleted,
                        isUpcoming && styles.stepLabelUpcoming,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isCurrent ? (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>CURRENT</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            );
          })}

          {/* If REOPENED, show the extra branch node */}
          {isReopened ? (
            <View style={styles.stepContainer}>
              <View style={styles.nodeColumn}>
                <View style={[styles.nodeCircle, styles.nodeReopened]}>
                  <MaterialCommunityIcons name="alert" size={14} color="#FFFFFF" />
                </View>
              </View>
              <View style={[styles.stepContent, styles.lastStepContent]}>
                <View style={styles.stepTitleRow}>
                  <Text style={[styles.stepLabel, { color: COLORS.error, fontWeight: 'bold' }]}>
                    Reopened for Revision
                  </Text>
                  <View style={[styles.currentBadge, { backgroundColor: COLORS.error + '18' }]}>
                    <Text style={[styles.currentBadgeText, { color: COLORS.error }]}>ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.stepDescription}>
                  Escalated to municipal supervisor for review
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.roundness * 1.5,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: THEME.padding.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    padding: THEME.padding.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.padding.md,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
  },
  currentStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  currentStatusPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reopenedBanner: {
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
  reopenedTextGroup: {
    flex: 1,
  },
  reopenedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  reopenedSubtitle: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 15,
  },
  timelineList: {
    marginTop: THEME.padding.xs,
  },
  stepContainer: {
    flexDirection: 'row',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 32,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: COLORS.success,
  },
  nodeCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  nodeUpcoming: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  nodeReopened: {
    backgroundColor: COLORS.error,
    borderWidth: 3,
    borderColor: '#FEE2E2',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: COLORS.success,
  },
  lineUpcoming: {
    backgroundColor: '#E2E8F0',
  },
  stepContent: {
    flex: 1,
    paddingLeft: THEME.padding.sm,
    paddingBottom: 22,
  },
  lastStepContent: {
    paddingBottom: 0,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepLabel: {
    fontSize: 14,
  },
  stepLabelCompleted: {
    fontWeight: '700',
    color: COLORS.text,
  },
  stepLabelCurrent: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  stepLabelUpcoming: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  currentBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  stepDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});

export default StatusTimeline;
