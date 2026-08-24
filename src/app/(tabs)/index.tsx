import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { COLORS, THEME } from '../../config/constants';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Mock statistics data
  const stats = {
    total: 4,
    resolved: 2,
    pending: 1,
    offline: 0,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Citizen Welcome Card */}
      <View style={styles.welcomeSection}>
        <View style={styles.avatarRow}>
          <Avatar.Text 
            size={48} 
            label={user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'C'} 
            style={{ backgroundColor: COLORS.primary }}
          />
          <View style={styles.welcomeTextContainer}>
            <Text variant="bodyMedium" style={styles.welcomeLabel}>Welcome back,</Text>
            <Text variant="titleLarge" style={styles.userName}>{user?.name || 'Citizen'}</Text>
          </View>
          <IconButton 
            icon="bell-outline" 
            iconColor={COLORS.textSecondary}
            onPress={() => console.log('Notifications')}
          />
        </View>
      </View>

      {/* Main Call to Action (Report Issue Button) */}
      <Card style={styles.reportCtaCard} mode="contained">
        <Card.Content style={styles.ctaContent}>
          <View style={styles.ctaTextContainer}>
            <Text variant="titleLarge" style={styles.ctaTitle}>Spotted a Civic Issue?</Text>
            <Text variant="bodyMedium" style={styles.ctaSubtitle}>
              Report potholes, garbage, or broken lights. AI will analyze and route it.
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => router.push('/issues/report' as any)}
            style={styles.ctaButton}
            labelStyle={styles.ctaButtonLabel}
            icon="plus-circle"
          >
            Report Now
          </Button>
        </Card.Content>
      </Card>

      {/* Statistics Section */}
      <Text variant="titleMedium" style={styles.sectionHeader}>Your Report Statistics</Text>
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { borderLeftColor: COLORS.info }]} mode="outlined">
          <Card.Content style={styles.statContent}>
            <Text variant="labelMedium" style={styles.statLabel}>Total Filed</Text>
            <Text variant="headlineMedium" style={[styles.statValue, { color: COLORS.info }]}>
              {stats.total}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: COLORS.success }]} mode="outlined">
          <Card.Content style={styles.statContent}>
            <Text variant="labelMedium" style={styles.statLabel}>Resolved</Text>
            <Text variant="headlineMedium" style={[styles.statValue, { color: COLORS.success }]}>
              {stats.resolved}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: COLORS.warning }]} mode="outlined">
          <Card.Content style={styles.statContent}>
            <Text variant="labelMedium" style={styles.statLabel}>In Progress</Text>
            <Text variant="headlineMedium" style={[styles.statValue, { color: COLORS.warning }]}>
              {stats.pending}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: COLORS.textSecondary }]} mode="outlined">
          <Card.Content style={styles.statContent}>
            <Text variant="labelMedium" style={styles.statLabel}>Pending Sync</Text>
            <Text variant="headlineMedium" style={[styles.statValue, { color: COLORS.textSecondary }]}>
              {stats.offline}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* General Broadcast/Alert Section */}
      <Text variant="titleMedium" style={styles.sectionHeader}>Community Broadcasts</Text>
      <Card style={styles.broadcastCard} mode="contained">
        <Card.Content>
          <View style={styles.broadcastHeader}>
            <IconButton icon="bullhorn-outline" iconColor={COLORS.primary} size={24} style={styles.broadcastIcon} />
            <View style={styles.broadcastTitleContainer}>
              <Text variant="titleSmall" style={styles.broadcastTitle}>Cleanliness Drive: Ward 12</Text>
              <Text variant="bodySmall" style={styles.broadcastMeta}>Posted 2 hours ago by Municipal Corp</Text>
            </View>
          </View>
          <Text variant="bodyMedium" style={styles.broadcastBody}>
            The monthly community waste clearing and segregation drive is scheduled for this Sunday at 8:00 AM. Location: Town Hall park. Participation is highly appreciated.
          </Text>
        </Card.Content>
      </Card>
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
  },
  welcomeSection: {
    marginBottom: THEME.padding.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
    marginLeft: THEME.padding.sm,
  },
  welcomeLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  userName: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  reportCtaCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: THEME.roundness * 1.5,
    marginBottom: THEME.padding.lg,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  ctaContent: {
    paddingVertical: THEME.padding.md,
  },
  ctaTextContainer: {
    marginBottom: THEME.padding.md,
  },
  ctaTitle: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  ctaSubtitle: {
    color: '#4338CA',
    marginTop: THEME.padding.xs,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: THEME.roundness,
  },
  ctaButtonLabel: {
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: THEME.padding.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: THEME.padding.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    marginBottom: THEME.padding.sm,
    borderRadius: THEME.roundness,
    borderLeftWidth: 4,
  },
  statContent: {
    padding: THEME.padding.sm,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: THEME.padding.xs,
  },
  broadcastCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  broadcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.padding.xs,
    marginLeft: -8,
  },
  broadcastIcon: {
    margin: 0,
  },
  broadcastTitleContainer: {
    flex: 1,
  },
  broadcastTitle: {
    fontWeight: 'bold',
  },
  broadcastMeta: {
    color: COLORS.textSecondary,
  },
  broadcastBody: {
    color: COLORS.text,
    lineHeight: 20,
    marginTop: THEME.padding.xs,
  },
});
