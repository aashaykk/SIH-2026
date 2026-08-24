import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Avatar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/AuthContext';
import { useIssuesQuery, useIssuesStatsQuery } from '../../hooks/useIssues';
import { IssueCard } from '../../components/IssueCard';
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
  const { data: stats, refetch: refetchStats } = useIssuesStatsQuery();

  const onRefresh = useCallback(() => {
    refetch();
    refetchStats();
  }, [refetch, refetchStats]);

  const activeReports = issues.filter(
    (issue) => issue.status !== 'RESOLVED' && issue.status !== 'VERIFIED'
  );

  const handleIssuePress = (issue: Issue) => {
    router.push(`/issues/${issue.id}` as any);
  };

  const handleReportPress = () => {
    router.push('/issues/report' as any);
  };

  const handleMyReportsPress = () => {
    router.push('/(tabs)/my-reports' as any);
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
    <View style={styles.outerContainer}>
      {/* 1. Header: VJTI Navy Header Bar */}
      <View style={styles.navyHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../../assets/images/vjti_logo.png')}
            style={styles.logoImage}
          />
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>VJTI Portal</Text>
            <Text style={styles.brandSubtitle}>Mumbai, India</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <IconButton
            icon="bell-outline"
            iconColor="#FFFFFF"
            size={22}
            onPress={() => {}}
            style={styles.headerActionBtn}
          />
          <TouchableOpacity onPress={handleProfilePress}>
            <Avatar.Text
              size={34}
              label={user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'C'}
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

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
        {/* 2. Hero Section: Transparency and Trust Banner */}
        <Card style={styles.heroCard} mode="contained">
          <Card.Content style={styles.heroContent}>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>Serving Citizens with Transparency and Trust</Text>
              <Text style={styles.heroSubtitle}>
                VJTI AI-Powered Civic Intelligence and Operations Network
              </Text>
              <View style={styles.heroBtnRow}>
                <TouchableOpacity style={styles.heroBtnPrimary} onPress={handleReportPress}>
                  <Text style={styles.heroBtnPrimaryText}>Report Issue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.heroBtnSecondary} onPress={handleMyReportsPress}>
                  <Text style={styles.heroBtnSecondaryText}>My Reports</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Image
              source={require('../../../assets/images/vjti_building.jpg')}
              style={styles.heroBuildingImage}
            />
          </Card.Content>
        </Card>

        {/* 3. Section: Public Services Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Public Services</Text>
        </View>
        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceItemCard} onPress={handleReportPress}>
            <View style={[styles.serviceIconWrapper, { backgroundColor: '#E6F4EA' }]}>
              <MaterialCommunityIcons name="bullhorn-variant-outline" size={24} color="#137333" />
            </View>
            <Text style={styles.serviceItemLabel}>Report Issue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceItemCard} onPress={handleMyReportsPress}>
            <View style={[styles.serviceIconWrapper, { backgroundColor: '#E8F0FE' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color="#1A73E8" />
            </View>
            <Text style={styles.serviceItemLabel}>My Grievances</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceItemCard} onPress={handleProfilePress}>
            <View style={[styles.serviceIconWrapper, { backgroundColor: '#FEF7E0' }]}>
              <MaterialCommunityIcons name="account-circle-outline" size={24} color="#B06000" />
            </View>
            <Text style={styles.serviceItemLabel}>My Profile</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Section: Announcements */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Latest Announcements</Text>
        </View>
        <Card style={styles.announcementCard} mode="contained">
          <Card.Content style={styles.announcementContent}>
            <View style={styles.announcementIconBox}>
              <MaterialCommunityIcons name="alert-decagram-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.announcementTextBox}>
              <Text style={styles.announcementTitle}>Ward 12 Infrastructure Upgrades</Text>
              <Text style={styles.announcementDesc}>
                AI-powered road clearing teams scheduled for Senapati Bapat Road next Monday.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
          </Card.Content>
        </Card>

        {/* 5. Section: Statistics */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Statistics</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.resolved ?? 0}</Text>
            <Text style={styles.statLabel}>Resolutions Verified</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.total ?? 0}</Text>
            <Text style={styles.statLabel}>Grievances Filed</Text>
          </View>
        </View>

        {/* 6. Section: Grievance Feed */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.feedTitleGroup}>
            <Text style={styles.sectionTitle}>Active Grievances</Text>
            <View style={styles.feedCountPill}>
              <Text style={styles.feedCountText}>{activeReports.length}</Text>
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
            message="All civic reports have been resolved. Excellent job, VJTI Ward Authorities!"
            actionText="Report New Issue"
            onAction={handleReportPress}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navyHeader: {
    backgroundColor: '#0D2240',
    height: 90,
    paddingTop: 36,
    paddingHorizontal: THEME.padding.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
  },
  brandTextGroup: {
    flexDirection: 'column',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    margin: 0,
  },
  headerAvatar: {
    backgroundColor: COLORS.accent,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.padding.md,
    paddingBottom: THEME.padding.xl * 2,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.roundness * 1.5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: THEME.padding.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.padding.md,
    gap: 12,
  },
  heroTextCol: {
    flex: 1.1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D2240',
    lineHeight: 22,
  },
  heroSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  heroBtnPrimary: {
    backgroundColor: '#0D2240',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  heroBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0D2240',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  heroBtnSecondaryText: {
    color: '#0D2240',
    fontSize: 11,
    fontWeight: '700',
  },
  heroBuildingImage: {
    flex: 0.9,
    height: 120,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.padding.md,
    marginBottom: THEME.padding.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0D2240',
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: THEME.padding.md,
  },
  serviceItemCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.roundness,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
    elevation: 1,
  },
  serviceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.roundness,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: THEME.padding.md,
  },
  announcementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  announcementIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6EFF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementTextBox: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  announcementDesc: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: THEME.padding.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.roundness,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D2240',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  feedTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedCountPill: {
    backgroundColor: '#E6EFF8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  feedCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D2240',
  },
});
