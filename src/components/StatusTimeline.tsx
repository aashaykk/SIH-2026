import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TimelineStep } from '../types/models';
import { COLORS, THEME } from '../config/constants';

interface StatusTimelineProps {
  timeline: TimelineStep[];
  style?: StyleProp<ViewStyle>;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ timeline, style }) => {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  return (
    <Surface style={[styles.container, style]} elevation={0}>
      <Text variant="titleMedium" style={styles.headerTitle}>
        Incident Resolution Timeline
      </Text>

      <View style={styles.timelineList}>
        {timeline.map((step, index) => {
          const isLast = index === timeline.length - 1;
          const isDone = step.status === 'done';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';

          // Determine line color between nodes
          const nextStep = timeline[index + 1];
          const lineIsDone = isDone && (nextStep?.status === 'done' || nextStep?.status === 'active');

          return (
            <View key={`${step.label}-${index}`} style={styles.stepRow}>
              {/* Node Column (Circle + Connector Line) */}
              <View style={styles.nodeColumn}>
                {/* Status Indicator Icon Node */}
                <View
                  style={[
                    styles.nodeCircle,
                    isDone && styles.nodeDone,
                    isActive && styles.nodeActive,
                    isPending && styles.nodePending,
                  ]}
                >
                  {isDone ? (
                    <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                  ) : isActive ? (
                    <View style={styles.activeDot} />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>

                {/* Vertical Connector Line */}
                {!isLast ? (
                  <View
                    style={[
                      styles.connectorLine,
                      lineIsDone ? styles.lineDone : styles.linePending,
                    ]}
                  />
                ) : null}
              </View>

              {/* Text Label & Timestamp Column */}
              <View style={styles.contentColumn}>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.label,
                    isDone && styles.labelDone,
                    isActive && styles.labelActive,
                    isPending && styles.labelPending,
                  ]}
                >
                  {step.label}
                </Text>
                {step.timestamp ? (
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {step.timestamp}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness,
    padding: THEME.padding.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: THEME.padding.md,
  },
  timelineList: {
    paddingLeft: THEME.padding.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: THEME.padding.md,
  },
  nodeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeDone: {
    backgroundColor: COLORS.success,
  },
  nodeActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nodePending: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.placeholder,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 26,
    marginVertical: 2,
  },
  lineDone: {
    backgroundColor: COLORS.success,
  },
  linePending: {
    backgroundColor: COLORS.border,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: THEME.padding.md,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
  labelDone: {
    color: COLORS.text,
    fontWeight: '600',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  labelPending: {
    color: COLORS.textSecondary,
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
