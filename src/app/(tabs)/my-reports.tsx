import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useIssuesQuery } from '../../hooks/useIssues';
import { IssueCard } from '../../components/IssueCard';
import { LoadingState } from '../../components/UI/LoadingState';
import { ErrorState } from '../../components/UI/ErrorState';
import { EmptyState } from '../../components/UI/EmptyState';
import { COLORS, THEME } from '../../config/constants';
import { Issue } from '../../types/models';

export default function MyReportsScreen() {
  const [filter, setFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const router = useRouter();

  const { data: issues = [], isLoading, isError, refetch, isRefetching } = useIssuesQuery();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'active') {
      return issue.status !== 'RESOLVED' && issue.status !== 'VERIFIED';
    }
    if (filter === 'resolved') {
      return issue.status === 'RESOLVED' || issue.status === 'VERIFIED';
    }
    return true; // 'all'
  });

  const handleIssuePress = (issue: Issue) => {
    router.push(`/issues/${issue.id}` as any);
  };

  const handleReportNew = () => {
    router.push('/issues/report' as any);
  };

  if (isLoading && !isRefetching) {
    return <LoadingState message="Loading your civic reports..." fullScreen />;
  }

  if (isError && !isRefetching && issues.length === 0) {
    return (
      <ErrorState
        title="Unable to load reports"
        message="Could not connect to the server. Please check your network connection."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtering Selector */}
      <View style={styles.filterSection}>
        <SegmentedButtons
          value={filter}
          onValueChange={(val) => setFilter(val as any)}
          buttons={[
            { value: 'active', label: `Active (${issues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'VERIFIED').length})` },
            { value: 'resolved', label: `Resolved (${issues.filter((i) => i.status === 'RESOLVED' || i.status === 'VERIFIED').length})` },
            { value: 'all', label: `All (${issues.length})` },
          ]}
          style={styles.segmentedButtons}
          theme={{ colors: { secondaryContainer: COLORS.primaryLight } }}
        />
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IssueCard issue={item} onPress={handleIssuePress} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={filter === 'resolved' ? 'checkbox-marked-circle-outline' : 'clipboard-text-outline'}
            title={filter === 'resolved' ? 'No Resolved Issues Yet' : 'No Reports Found'}
            message={
              filter === 'resolved'
                ? 'Resolved civic reports will appear here once verified.'
                : 'You have not submitted any civic reports in this category.'
            }
            actionText="Report Civic Issue"
            onAction={handleReportNew}
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  segmentedButtons: {
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: THEME.padding.md,
    paddingBottom: THEME.padding.xl * 2,
    flexGrow: 1,
  },
});
