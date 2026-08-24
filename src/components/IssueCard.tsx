import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Issue } from '../types/models';
import { COLORS, THEME, CIVIC_CATEGORIES, ISSUE_STATUSES, ISSUE_PRIORITIES } from '../config/constants';

interface IssueCardProps {
  issue: Issue;
  onPress: (issue: Issue) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onPress }) => {
  const categoryConfig = CIVIC_CATEGORIES.find((c) => c.id === issue.category) || {
    label: issue.category || 'Civic Issue',
    icon: 'alert-circle-outline',
    color: COLORS.primary,
  };

  const statusConfig = ISSUE_STATUSES[issue.status] || {
    label: issue.status,
    color: COLORS.info,
    icon: 'clock-outline',
  };

  const priorityConfig = ISSUE_PRIORITIES[issue.priority] || {
    label: issue.priority,
    color: COLORS.severityMedium,
  };

  // Format date nicely
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Pressable
      onPress={() => onPress(issue)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardContent}>
        {/* Top Header Row: Category & Status */}
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Avatar.Icon
              size={24}
              icon={categoryConfig.icon}
              style={[styles.categoryIcon, { backgroundColor: categoryConfig.color + '15' }]}
              color={categoryConfig.color}
            />
            <Text variant="labelMedium" style={[styles.categoryText, { color: categoryConfig.color }]}>
              {categoryConfig.label}
            </Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: statusConfig.color + '15' }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Main Body: Title, Description & Optional Image */}
        <View style={styles.bodyRow}>
          <View style={styles.textContainer}>
            <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
              {issue.title || `${categoryConfig.label} Report`}
            </Text>
            {issue.description ? (
              <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
                {issue.description}
              </Text>
            ) : null}
          </View>

          {issue.imageUrl ? (
            <Image
              source={{ uri: issue.imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <MaterialCommunityIcons
                name="image-outline"
                size={22}
                color={COLORS.placeholder}
              />
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer Row: Priority, Report Count, & Date */}
        <View style={styles.footerRow}>
          <View style={styles.badgeGroup}>
            {/* Priority Badge */}
            <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '15' }]}>
              <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
              <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                {priorityConfig.label}
              </Text>
            </View>

            {/* Multiple Reports Multiplier */}
            {issue.reportCount > 1 ? (
              <View style={styles.reportCountBadge}>
                <MaterialCommunityIcons name="account-multiple" size={13} color={COLORS.primary} />
                <Text style={styles.reportCountText}>
                  {issue.reportCount} reports
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar-outline" size={13} color={COLORS.textSecondary} />
            <Text variant="bodySmall" style={styles.dateText}>
              {formatDate(issue.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.25,
    marginBottom: THEME.padding.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  cardContent: {
    padding: THEME.padding.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.padding.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: THEME.padding.sm,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 12,
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
  bodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.padding.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: THEME.padding.md,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 15,
  },
  description: {
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: THEME.roundness,
    backgroundColor: COLORS.background,
  },
  placeholderThumbnail: {
    width: 64,
    height: 64,
    borderRadius: THEME.roundness,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: THEME.padding.sm,
    opacity: 0.6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reportCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});

export default IssueCard;
