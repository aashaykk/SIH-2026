import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, SegmentedButtons, Card, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { COLORS, THEME, CIVIC_CATEGORIES, ISSUE_STATUSES, ISSUE_PRIORITIES } from '../../config/constants';

interface IssueItem {
  id: string;
  title: string;
  category: string;
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'PENDING_SYNC';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  locationName: string;
}

export default function MyReportsScreen() {
  const [filter, setFilter] = useState('active');
  const router = useRouter();

  // Mock list of issues
  const mockIssues: IssueItem[] = [
    {
      id: '101',
      title: 'Large Pothole near Central Park Gate 2',
      category: 'pothole',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: '2026-08-22',
      locationName: 'Central Park Main Rd, Ward 4',
    },
    {
      id: '102',
      title: 'Uncollected Garbage Pile outside Market',
      category: 'garbage',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      createdAt: '2026-08-20',
      locationName: 'City Market Square, Ward 12',
    },
    {
      id: '103',
      title: 'Water pipe burst leakage on pavement',
      category: 'water_leakage',
      status: 'ASSIGNED',
      priority: 'HIGH',
      createdAt: '2026-08-23',
      locationName: '3rd Cross St, Sector 2',
    },
    {
      id: '104',
      title: 'Streetlight blinking continuously',
      category: 'streetlight',
      status: 'SUBMITTED',
      priority: 'LOW',
      createdAt: '2026-08-24',
      locationName: 'Greenwood Lane, Ward 7',
    },
  ];

  const filteredIssues = mockIssues.filter(issue => {
    if (filter === 'active') {
      return issue.status !== 'RESOLVED' && issue.status !== 'PENDING_SYNC';
    }
    if (filter === 'resolved') {
      return issue.status === 'RESOLVED';
    }
    if (filter === 'offline') {
      return issue.status === 'PENDING_SYNC';
    }
    return true; // 'all'
  });

  const getCategoryDetails = (catId: string) => {
    return CIVIC_CATEGORIES.find(c => c.id === catId) || { label: 'General', icon: 'alert-circle', color: COLORS.textSecondary };
  };

  const renderIssueCard = ({ item }: { item: IssueItem }) => {
    const cat = getCategoryDetails(item.category);
    const statusInfo = ISSUE_STATUSES[item.status];
    const priorityInfo = ISSUE_PRIORITIES[item.priority];

    return (
      <Card 
        style={styles.card} 
        mode="contained" 
        onPress={() => router.push(`/issues/${item.id}` as any)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Avatar.Icon 
              size={36} 
              icon={cat.icon} 
              style={{ backgroundColor: cat.color + '15' }} // 15% opacity tint
              color={cat.color} 
            />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={styles.issueTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.locationText}>
                {item.locationName}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: statusInfo.color + '15' }]}>
                <Text style={[styles.badgeText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: priorityInfo.color + '15' }]}>
                <Text style={[styles.badgeText, { color: priorityInfo.color }]}>
                  {priorityInfo.label} Priority
                </Text>
              </View>
            </View>
            <Text variant="bodySmall" style={styles.dateText}>{item.createdAt}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtering Selector */}
      <View style={styles.filterSection}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'active', label: 'Active' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'offline', label: 'Offline' },
            { value: 'all', label: 'All' },
          ]}
          style={styles.segmentedButtons}
          theme={{ colors: { secondaryContainer: COLORS.primaryLight } }}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item.id}
        renderItem={renderIssueCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Avatar.Icon size={64} icon="alert-outline" style={{ backgroundColor: 'transparent' }} color={COLORS.textSecondary} />
            <Text variant="titleMedium" style={styles.emptyTitle}>No reports found</Text>
            <Text variant="bodyMedium" style={styles.emptySub}>
              Issues in this category will appear here.
            </Text>
          </View>
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
  },
  card: {
    marginBottom: THEME.padding.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.roundness,
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
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  dateText: {
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.padding.xl * 2,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: THEME.padding.sm,
  },
  emptySub: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: THEME.padding.xs,
  },
});
