import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/AuthContext';
import { useIssuesQuery } from '../../hooks/useIssues';
import { IssueCard } from '../../components/IssueCard';
import { PrimaryButton } from '../../components/UI/PrimaryButton';
import { LoadingState } from '../../components/UI/LoadingState';
import { ErrorState } from '../../components/UI/ErrorState';
import { EmptyState } from '../../components/UI/EmptyState';
import { COLORS, THEME } from '../../config/constants';
import { Issue } from '../../types/models';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch live civic issues via React Query
  const { data: issues = [], isLoading, isError, refetch, isRefetching } = useIssuesQuery();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Compute greeting dynamically
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Separate into Active Reports and Recently Resolved
  const activeReports = issues.filter(
    (issue) => issue.status !== 'RESOLVED' && issue.status !== 'VERIFIED'
  );

  const resolvedReports = issues.filter(
    (issue) => issue.status === 'RESOLVED' || issue.status === 'VERIFIED'
  );

  const handleIssuePress = (issue: Issue) => {
    router.push(`/issues/${issue.id}` as any);
  };

  const handleReportPress = () => {
    router.push('/issues/report' as any);
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile' as any);
  };

  // Initial loading state
  if (isLoading && !isRefetching) {
    return <LoadingState message="Loading your civic dashboard..." fullScreen />;
  }

  // Error state
  if (isError && !isRefetching && issues.length === 0) {
    return (
      <ErrorState
        title="Unable to load civic issues"
        message="Could not reach the server. Please check your network connection."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* 1. Header: Greeting, User Profile, Notifications */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userProfileRow} onPress={handleProfilePress}>
          <Avatar.Text
            size={46}
            label={user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'C'}
            style={styles.avatar}
          />
          <View style={styles.welcomeTextGroup}>
            <Text variant="bodySmall" style={styles.greetingText}>
              {getGreeting()},
            </Text>
            <Text variant="titleMedium" style={styles.userName} numberOfLines={1}>
              {user?.name || 'Citizen'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <IconButton
            icon="bell-outline"
            iconColor={COLORS.textSecondary}
            size={22}
            onPress={() => {}}
            style={styles.iconBtn}
          />
          <IconButton
            icon="cog-outline"
            iconColor={COLORS.textSecondary}
            size={22}
            onPress={handleProfilePress}
            style={styles.iconBtn}
          />
        </View>
      </View>

      {/* 2. Primary CTA: Report Issue */}
      <Card style={styles.reportCtaCard} mode="contained">
        <Card.Content style={styles.ctaContent}>
          <View style={styles.ctaHeaderRow}>
            <View style={styles.ctaIconContainer}>
              <MaterialCommunityIcons name="bullhorn-variant" size={26} color={COLORS.primary} />
            </View>
            <View style={styles.ctaTextGroup}>
              <Text variant="titleMedium" style={styles.ctaTitle}>
                Report a Civic Issue
              </Text>
              <Text variant="bodySmall" style={styles.ctaSubtitle}>
                Spot a pothole, garbage, or broken light? Report it instantly.
              </Text>
            </View>
          </View>

          <PrimaryButton
            onPress={handleReportPress}
            icon="camera-plus"
            style={styles.reportButton}
          >
            REPORT ISSUE
          </PrimaryButton>
        </Card.Content>
      </Card>

      {/* Summary KPI Badges */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { borderLeftColor: COLORS.info }]}>
          <Text variant="headlineSmall" style={[styles.metricNumber, { color: COLORS.info }]}>
            {activeReports.length}
          </Text>
          <Text variant="labelSmall" style={styles.metricLabel}>
            Active Reports
          </Text>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: COLORS.success }]}>
          <Text variant="headlineSmall" style={[styles.metricNumber, { color: COLORS.success }]}>
            {resolvedReports.length}
          </Text>
          <Text variant="labelSmall" style={styles.metricLabel}>
            Resolved
          </Text>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: COLORS.primary }]}>
          <Text variant="headlineSmall" style={[styles.metricNumber, { color: COLORS.primary }]}>
            {issues.length}
          </Text>
          <Text variant="labelSmall" style={styles.metricLabel}>
            Total Issues
          </Text>
        </View>
      </View>

      {/* 3. Section: Active Reports */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleGroup}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Active Reports
          </Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{activeReports.length}</Text>
          </View>
        </View>
      </View>

      {activeReports.length > 0 ? (
        activeReports.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onPress={handleIssuePress}
          />
        ))
      ) : (
        <EmptyState
          icon="check-circle-outline"
          title="No Active Issues"
          message="There are currently no open or unresolved reports in your area."
          actionText="Report Issue"
          onAction={handleReportPress}
        />
      )}

      {/* 4. Section: Recently Resolved */}
      <View style={[styles.sectionHeaderRow, styles.resolvedSectionHeader]}>
        <View style={styles.sectionTitleGroup}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recently Resolved
          </Text>
          <View style={[styles.countPill, { backgroundColor: COLORS.success + '15' }]}>
            <Text style={[styles.countText, { color: COLORS.success }]}>
              {resolvedReports.length}
            </Text>
          </View>
        </View>
      </View>

      {resolvedReports.length > 0 ? (
        resolvedReports.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onPress={handleIssuePress}
          />
        ))
      ) : (
        <View style={styles.resolvedEmptyCard}>
          <MaterialCommunityIcons
            name="history"
            size={32}
            color={COLORS.textSecondary}
            style={{ opacity: 0.6 }}
          />
          <Text variant="bodySmall" style={styles.resolvedEmptyText}>
            Resolved civic reports will appear here once verified.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: THEME.padding.md,
    paddingBottom: THEME.padding.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.padding.md,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  welcomeTextGroup: {
    marginLeft: THEME.padding.sm,
    flex: 1,
  },
  greetingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  userName: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    margin: 0,
  },
  reportCtaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.5,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    marginBottom: THEME.padding.md,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  ctaContent: {
    padding: THEME.padding.md,
  },
  ctaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.padding.md,
  },
  ctaIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.padding.sm,
  },
  ctaTextGroup: {
    flex: 1,
  },
  ctaTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ctaSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  reportButton: {
    borderRadius: THEME.roundness,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.padding.lg,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: THEME.padding.sm,
    borderRadius: THEME.roundness,
    borderLeftWidth: 3.5,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  metricNumber: {
    fontWeight: 'bold',
    lineHeight: 28,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.padding.sm,
    marginTop: THEME.padding.xs,
  },
  resolvedSectionHeader: {
    marginTop: THEME.padding.lg,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  countPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  resolvedEmptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: THEME.padding.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resolvedEmptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
