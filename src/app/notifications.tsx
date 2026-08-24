import React from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { Text, Avatar, Surface, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getNotifications, markNotificationAsRead } from '../services/notifications.api';
import { CitizenNotification, NotificationType } from '../types/models';
import { LoadingState } from '../components/UI/LoadingState';
import { EmptyState } from '../components/UI/EmptyState';
import { ErrorState } from '../components/UI/ErrorState';
import { COLORS, THEME } from '../config/constants';

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getNotificationIconDetails = (type: NotificationType) => {
    switch (type) {
      case 'report_assigned':
        return { icon: 'account-check-outline', color: '#8B5CF6' };
      case 'worker_started':
        return { icon: 'hard-hat', color: '#F59E0B' };
      case 'resolution_submitted':
        return { icon: 'file-check-outline', color: '#06B6D4' };
      case 'verification_required':
        return { icon: 'shield-alert-outline', color: '#EC4899' };
      case 'issue_closed':
        return { icon: 'check-circle-outline', color: '#10B981' };
      case 'issue_reopened':
        return { icon: 'alert-circle-outline', color: '#EF4444' };
      case 'VERIFICATION_REQUEST':
        return { icon: 'shield-alert-outline', color: '#EC4899' };
      case 'STATUS_UPDATE':
        return { icon: 'clock-outline', color: COLORS.primary };
      case 'GENERAL':
      default:
        return { icon: 'bell-outline', color: COLORS.primary };
    }
  };

  const handleNotificationPress = (notification: CitizenNotification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.incidentId) {
      router.push(`/issues/${notification.incidentId}` as any);
    }
  };

  const renderNotificationItem = ({ item }: { item: CitizenNotification }) => {
    const { icon, color } = getNotificationIconDetails(item.type);

    return (
      <Pressable onPress={() => handleNotificationPress(item)}>
        <Surface
          style={[
            styles.notificationCard,
            !item.read ? styles.unreadCard : styles.readCard,
          ]}
          elevation={0}
        >
          <View style={styles.cardHeader}>
            <Avatar.Icon
              size={42}
              icon={icon}
              style={{ backgroundColor: color + '18' }}
              color={color}
            />

            <View style={styles.contentContainer}>
              <View style={styles.titleRow}>
                <Text
                  variant="titleSmall"
                  style={[styles.title, !item.read && styles.unreadText]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!item.read ? <View style={styles.unreadDot} /> : null}
              </View>

              <Text variant="bodySmall" style={styles.message} numberOfLines={2}>
                {item.message}
              </Text>

              <Text variant="bodySmall" style={styles.timestamp}>
                {new Date(item.createdAt).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Text>
            </View>

            {item.incidentId ? (
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.placeholder} />
            ) : null}
          </View>
        </Surface>
      </Pressable>
    );
  };

  if (isLoading && !isRefetching) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Fetching notifications..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Could Not Load Notifications"
          message={error instanceof Error ? error.message : 'Unable to connect.'}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Screen Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </Pressable>
        <Text variant="titleMedium" style={styles.topBarTitle}>
          Notifications
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
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
            icon="bell-off-outline"
            title="No Notifications"
            message="You don't have any updates or alerts at the moment."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.padding.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: THEME.padding.xs,
  },
  topBarTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listContainer: {
    padding: THEME.padding.md,
    flexGrow: 1,
  },
  notificationCard: {
    borderRadius: THEME.roundness,
    padding: THEME.padding.md,
    marginBottom: THEME.padding.sm,
    borderWidth: 1,
  },
  unreadCard: {
    backgroundColor: COLORS.primaryLight + '50',
    borderColor: COLORS.primary + '40',
  },
  readCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginLeft: THEME.padding.md,
    marginRight: THEME.padding.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.text,
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  message: {
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },
});
