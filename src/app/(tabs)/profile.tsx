import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, List, Divider, Button, Switch } from 'react-native-paper';
import { useAuth } from '../../features/auth/AuthContext';
import { COLORS, THEME } from '../../config/constants';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar.Text 
          size={72} 
          label={user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'C'} 
          style={[{ backgroundColor: COLORS.primary }, styles.avatar]}
        />
        <Text variant="headlineSmall" style={styles.name}>{user?.name || 'Citizen'}</Text>
        <Text variant="bodyMedium" style={styles.email}>{user?.email || 'citizen@nagar-x.gov'}</Text>
        <View style={styles.roleTag}>
          <Text style={styles.roleText}>{user?.role ? user.role.toUpperCase() : 'CITIZEN'}</Text>
        </View>
      </View>

      {/* Account Settings List */}
      <List.Section style={styles.section}>
        <List.Subheader style={styles.subheader}>Preferences</List.Subheader>
        
        <List.Item
          title="Push Notifications"
          description="Receive severity alerts & resolution updates"
          left={(props) => <List.Icon {...props} icon="bell-ring-outline" />}
          right={() => (
            <Switch 
              value={notifications} 
              onValueChange={setNotifications} 
              color={COLORS.primary} 
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Auto Offline Sync"
          description="Sync pending issues when internet reconnects"
          left={(props) => <List.Icon {...props} icon="cloud-sync-outline" />}
          right={() => (
            <Switch 
              value={autoSync} 
              onValueChange={setAutoSync} 
              color={COLORS.primary} 
            />
          )}
        />
      </List.Section>

      {/* Municipal Ward details */}
      <List.Section style={styles.section}>
        <List.Subheader style={styles.subheader}>Local Jurisdiction Info</List.Subheader>
        
        <List.Item
          title="Assigned Municipal Corp"
          description="Municipal Corporation of Greater Mumbai (MCGM)"
          left={(props) => <List.Icon {...props} icon="town-hall" />}
        />
        
        <Divider />
        
        <List.Item
          title="Current Ward Circle"
          description="Ward 12 (Sector 4-B)"
          left={(props) => <List.Icon {...props} icon="map-marker-radius-outline" />}
        />
      </List.Section>

      {/* Logout Action */}
      <View style={styles.logoutWrapper}>
        <Button
          mode="outlined"
          icon="logout"
          onPress={logout}
          style={styles.logoutButton}
          textColor={COLORS.error}
          labelStyle={styles.logoutButtonLabel}
        >
          Sign Out
        </Button>
        <Text variant="bodySmall" style={styles.versionText}>
          NAGAR-X v1.0.0 (SIH Prototype Build)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: THEME.padding.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    marginBottom: THEME.padding.md,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  name: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  email: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: THEME.padding.sm,
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    marginTop: THEME.padding.md,
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderBottomColor: COLORS.border,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  subheader: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  logoutWrapper: {
    padding: THEME.padding.lg,
    alignItems: 'center',
    marginBottom: THEME.padding.xl,
  },
  logoutButton: {
    width: '100%',
    borderColor: COLORS.error,
    borderRadius: THEME.roundness,
  },
  logoutButtonLabel: {
    fontWeight: 'bold',
  },
  versionText: {
    color: COLORS.textSecondary,
    marginTop: THEME.padding.md,
  },
});
