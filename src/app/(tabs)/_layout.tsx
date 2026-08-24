import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
          elevation: 2,
          shadowOpacity: 0.05,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: COLORS.text,
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'NAGAR-X Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "home" : "home-outline"} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-reports"
        options={{
          title: 'My Reports',
          headerTitle: 'My Civic Reports',
          tabBarLabel: 'My Reports',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "alert-box" : "alert-box-outline"} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile & Settings',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "account" : "account-outline"} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
