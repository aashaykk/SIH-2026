import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const COLORS = {
  // Brand colors
  primary: '#4F46E5',     // Sleek Indigo
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  accent: '#06B6D4',      // Radiant Teal
  background: '#F9FAFB',  // Warm Off-White
  surface: '#FFFFFF',
  
  // Statuses & Severity Colors
  success: '#10B981',     // Emerald Green
  warning: '#F59E0B',     // Amber
  error: '#EF4444',       // Crimson Red
  info: '#3B82F6',        // Electric Blue
  
  // Neutral colors
  text: '#111827',        // Very dark gray (almost black)
  textSecondary: '#6B7280',// Slate gray
  border: '#E5E7EB',      // Soft gray borders
  placeholder: '#9CA3AF',
  cardBg: '#FFFFFF',
  
  // App specific categories
  severityLow: '#10B981',
  severityMedium: '#F59E0B',
  severityHigh: '#EF4444',
  severityCritical: '#7F1D1D',
};

export const THEME = {
  roundness: 12,
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fonts: {
    regular: 'System',
    medium: 'System-Medium',
    bold: 'System-Bold',
  }
};

export const CIVIC_CATEGORIES = [
  { id: 'ROAD_DAMAGE', label: 'Road Damage & Potholes', icon: 'road-variant', color: '#6B7280' },
  { id: 'GARBAGE', label: 'Garbage & Sanitation', icon: 'trash-can-outline', color: '#10B981' },
  { id: 'STREETLIGHT', label: 'Streetlight & Electrical', icon: 'lightbulb-outline', color: '#F59E0B' },
  { id: 'WATER_LEAKAGE', label: 'Water Leakage & Sewage', icon: 'water-pump', color: '#3B82F6' },
  { id: 'OTHER', label: 'Other Civic Issues', icon: 'alert-circle-outline', color: '#8B5CF6' },
];

export const ISSUE_STATUSES = {
  REPORTED: { label: 'Reported', color: '#3B82F6', icon: 'clock-outline' },
  ACKNOWLEDGED: { label: 'Acknowledged', color: '#8B5CF6', icon: 'account-check-outline' },
  IN_PROGRESS: { label: 'In Progress', color: '#F59E0B', icon: 'progress-wrench' },
  RESOLVED: { label: 'Resolved', color: '#10B981', icon: 'check-circle-outline' },
  VERIFIED: { label: 'Verified', color: '#059669', icon: 'shield-check-outline' },
  REOPENED: { label: 'Reopened', color: '#EF4444', icon: 'alert-circle-outline' },
};

export const ISSUE_PRIORITIES = {
  LOW: { label: 'Low', color: COLORS.severityLow, score: 1 },
  MEDIUM: { label: 'Medium', color: COLORS.severityMedium, score: 2 },
  HIGH: { label: 'High', color: COLORS.severityHigh, score: 3 },
  CRITICAL: { label: 'Critical', color: COLORS.severityCritical, score: 4 },
};

export const ROLES = {
  CITIZEN: 'CITIZEN',
  OFFICER: 'OFFICER',
  ADMIN: 'ADMIN',
} as const;

// Determine API base URL dynamically so physical phones on Wi-Fi connect seamlessly
const getApiBaseUrl = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      // Extract host IP dynamically from Expo Metro connection
      const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
      if (hostUri) {
        const ip = hostUri.split(':')[0];
        // Ignore loopback and unreachable 192.0.0.x point-to-point interface
        if (ip && !ip.startsWith('192.0.0.') && ip !== 'localhost' && ip !== '127.0.0.1') {
          return `http://${ip}:3000/api`;
        }
      }
    } catch (err) {
      console.warn('[Constants] Could not read hostUri from Expo Constants:', err);
    }

    // Default to Mac Wi-Fi LAN IP
    return 'http://192.168.0.109:3000/api';
  }

  return 'http://localhost:3000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 15000,
};




