import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, SegmentedButtons, Card, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyReports } from '../../services/incidents.api';
import { Incident } from '../../types/models';
import { LoadingState } from '../../components/UI/LoadingState';
import { EmptyState } from '../../components/UI/EmptyState';
import { ErrorState } from '../../components/UI/ErrorState';
import { COLORS, THEME, CIVIC_CATEGORIES, ISSUE_STATUSES, ISSUE_PRIORITIES } from '../../config/constants';

export default function MyReportsScreen() {
  const [filter, setFilter] = useState('active');
  const router = useRouter();

  const {
    data: reports,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['myReports', filter],
    queryFn: () => getMyReports(filter),
  });

  const getCategoryDetails = (catId: string) => {
    return (
      CIVIC_CATEGORIES.find((c) => c.id === catId) || {
        label: 'General Issue',
        icon: 'alert-circle',
        color: COLORS.primary,
      }
    );
  };

  const getPriorityBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return COLORS.severityCritical;
      case 'HIGH':
        return COLORS.severityHigh;
      case 'MEDIUM':
        return COLORS.severityMedium;
      case 'LOW':
      default:
        return COLORS.severityLow;
    }
  };

  const renderIncidentCard = ({ item }: { item: Incident }) => {
    const cat = getCategoryDetails(item.category);
    const statusInfo = ISSUE_STATUSES[item.status] || {
      label: item.status,
      color: COLORS.primary,
      icon: 'information-outline',
    };
    const priorityColor = getPriorityBadgeColor(item.priority.level);

    return (
      <Card
        style={styles.card}
        mode="contained"
        onPress={() => router.push(`/issues/${item.id}` as any)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Avatar.Icon
              size={40}
              icon={cat.icon}
              style={{ backgroundColor: cat.color + '18' }}
              color={cat.color}
            />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={styles.issueTitle} numberOfLines={1}>
                {item.title || `${cat.label} Incident`}
              </Text>
              <Text variant="bodySmall" style={styles.locationText} numberOfLines={1}>
                {item.ward} {item.locationName ? `• ${item.locationName}` : ''}
              </Text>
            </View>
          </View>

          {item.description ? (
            <Text variant="bodySmall" style={styles.descriptionText} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View style={styles.badgeRow}>
              {/* Status Badge */}
              <View style={[styles.badge, { backgroundColor: statusInfo.color + '18' }]}>
                <Text style={[styles.badgeText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
              {/* Priority Badge */}
              <View style={[styles.badge, { backgroundColor: priorityColor + '18' }]}>
                <Text style={[styles.badgeText, { color: priorityColor }]}>
                  {item.priority.level} ({item.priority.score})
                </Text>
              </View>
              {/* Reports Count Badge */}
              {item.reportsCount > 1 ? (
                <View style={[styles.badge, { backgroundColor: COLORS.info + '18' }]}>
                  <Text style={[styles.badgeText, { color: COLORS.info }]}>
                    {item.reportsCount} Reports
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="bodySmall" style={styles.dateText}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && !isRefetching) {
    return <LoadingState message="Fetching your civic reports..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Reports"
        message={error instanceof Error ? error.message : 'Unable to connect to service.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'active', label: 'Active' },
            { value: 'VERIFICATION_REQUIRED', label: 'Verify' },
            { value: 'CLOSED', label: 'Closed' },
            { value: 'all', label: 'All' },
          ]}
          style={styles.segmentedButtons}
          theme={{ colors: { secondaryContainer: COLORS.primaryLight } }}
        />
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderIncidentCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-text-outline"
            title="No Incidents Found"
            message={`There are no ${filter === 'all' ? '' : filter.toLowerCase()} reports to display at this time.`}
            onAction={() => router.push('/issues/report' as any)}
            actionText="Report New Incident"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterSection: {
    paddingHorizontal: THEME.padding.md,
    paddingTop: THEME.padding.md,
    paddingBottom: THEME.padding.sm,
  },
  segmentedButtons: {
    backgroundColor: COLORS.surface,
  },
  listContainer: {
    padding: THEME.padding.md,
    flexGrow: 1,
  },
  card: {
    marginBottom: THEME.padding.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.roundness,
    elevation: 1,
  },
  cardContent: {
    paddingHorizontal: THEME.padding.md,
    paddingVertical: THEME.padding.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: THEME.padding.sm,
  },
  issueTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  locationText: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  descriptionText: {
    color: COLORS.textSecondary,
    marginTop: THEME.padding.xs,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: THEME.padding.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
