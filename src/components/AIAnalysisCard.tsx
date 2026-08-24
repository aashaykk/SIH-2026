import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Issue } from '../types/models';
import { COLORS, THEME, CIVIC_CATEGORIES, ISSUE_PRIORITIES } from '../config/constants';

interface AIAnalysisCardProps {
  issue: Issue;
  style?: any;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ issue, style }) => {
  const categoryConfig = CIVIC_CATEGORIES.find((c) => c.id === issue.category) || {
    label: issue.category ? issue.category.replace('_', ' ') : 'Civic Issue',
    icon: 'alert-circle-outline',
    color: COLORS.primary,
  };

  const priorityConfig = ISSUE_PRIORITIES[issue.priority] || {
    label: issue.priority || 'Medium',
    color: COLORS.severityMedium,
  };

  // Format SLA Deadline
  const formatSla = (slaDateString?: string | null) => {
    if (!slaDateString) return null;
    try {
      const deadline = new Date(slaDateString);
      return deadline.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  const formattedSla = formatSla(issue.slaDeadline);
  const confidencePercent =
    issue.aiConfidence !== null && issue.aiConfidence !== undefined
      ? Math.round(issue.aiConfidence * 100)
      : null;

  // Format category display text
  const categoryDisplayName = issue.category
    ? issue.category.replace('_', ' ')
    : categoryConfig.label.toUpperCase();

  return (
    <Card style={[styles.card, style]} mode="contained">
      <Card.Content style={styles.cardContent}>
        {/* 1. Header Label */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>AI ANALYSIS</Text>
          {issue.reportCount > 1 ? (
            <View style={styles.duplicateTag}>
              <MaterialCommunityIcons name="layers-outline" size={13} color="#92400E" />
              <Text style={styles.duplicateTagText}>{issue.reportCount} Combined Reports</Text>
            </View>
          ) : null}
        </View>

        {/* 2. Highlighted Category */}
        <Text style={[styles.categoryHeadline, { color: categoryConfig.color }]}>
          {categoryDisplayName}
        </Text>

        {/* Duplicate Notice Banner if applicable */}
        {issue.reportCount > 1 ? (
          <View style={styles.duplicateBanner}>
            <MaterialCommunityIcons name="information" size={16} color="#92400E" />
            <Text variant="bodySmall" style={styles.duplicateBannerText}>
              Duplicate report detected within 100m. Priority recalculated based on {issue.reportCount} incidents.
            </Text>
          </View>
        ) : null}

        {/* 3. Metric Fields (Confidence, Severity, Priority, Department) */}
        <View style={styles.grid}>
          {/* Confidence */}
          {confidencePercent !== null ? (
            <View style={styles.gridItem}>
              <Text style={styles.label}>Confidence</Text>
              <Text style={[styles.value, { color: COLORS.text }]}>
                {confidencePercent}%
              </Text>
            </View>
          ) : null}

          {/* Severity */}
          {issue.severity ? (
            <View style={styles.gridItem}>
              <Text style={styles.label}>Severity</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color:
                      issue.severity === 'CRITICAL' || issue.severity === 'HIGH'
                        ? COLORS.error
                        : issue.severity === 'MEDIUM'
                        ? COLORS.warning
                        : COLORS.success,
                  },
                ]}
              >
                {issue.severity}
              </Text>
            </View>
          ) : null}

          {/* Priority */}
          {issue.priority ? (
            <View style={styles.gridItem}>
              <Text style={styles.label}>Priority</Text>
              <Text style={[styles.value, { color: priorityConfig.color }]}>
                {issue.priority}
              </Text>
            </View>
          ) : null}

          {/* Department */}
          {issue.department ? (
            <View style={styles.gridItem}>
              <Text style={styles.label}>Department</Text>
              <Text style={[styles.value, { color: COLORS.primaryDark }]}>
                {issue.department}
              </Text>
            </View>
          ) : null}
        </View>

        {/* SLA Target if available */}
        {formattedSla ? (
          <View style={styles.slaRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.info} />
            <View style={styles.slaTextGroup}>
              <Text style={styles.slaLabel}>SLA RESOLUTION TARGET</Text>
              <Text style={styles.slaValue}>{formattedSla}</Text>
            </View>
          </View>
        ) : null}
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
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
  },
  duplicateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  duplicateTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  categoryHeadline: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: THEME.padding.md,
    textTransform: 'uppercase',
  },
  duplicateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: THEME.padding.sm,
    borderRadius: THEME.roundness,
    marginBottom: THEME.padding.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  duplicateBannerText: {
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    columnGap: 16,
  },
  gridItem: {
    width: '46%',
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  slaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: THEME.padding.sm,
    borderRadius: THEME.roundness,
    marginTop: THEME.padding.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  slaTextGroup: {
    flex: 1,
  },
  slaLabel: {
    color: COLORS.info,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  slaValue: {
    color: '#1E40AF',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 1,
  },
});

export default AIAnalysisCard;
