/**
 * NAGAR-X Design Tokens & Configuration Constants
 * Centralized theme colors, category options, and UI metrics.
 */

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
  { id: 'pothole', label: 'Pothole & Roads', icon: 'road-variant', color: '#6B7280' },
  { id: 'garbage', label: 'Garbage & Waste', icon: 'trash-can-outline', color: '#10B981' },
  { id: 'streetlight', label: 'Broken Streetlight', icon: 'lightbulb-outline', color: '#F59E0B' },
  { id: 'water_leakage', label: 'Water Leakage', icon: 'water-pump', color: '#3B82F6' },
  { id: 'sewage', label: 'Sewage Overflow', icon: 'pipe-leak', color: '#EF4444' },
  { id: 'encroachment', label: 'Public Encroachment', icon: 'home-alert-outline', color: '#8B5CF6' },
];

export const ISSUE_STATUSES = {
  SUBMITTED: { label: 'Submitted', color: '#3B82F6', icon: 'clock-outline' },
  PENDING_SYNC: { label: 'Pending Sync', color: '#9CA3AF', icon: 'sync-alert' },
  ASSIGNED: { label: 'Assigned', color: '#8B5CF6', icon: 'account-check-outline' },
  IN_PROGRESS: { label: 'In Progress', color: '#F59E0B', icon: 'progress-wrench' },
  RESOLVED: { label: 'Resolved', color: '#10B981', icon: 'check-circle-outline' },
  REOPENED: { label: 'Reopened', color: '#EF4444', icon: 'alert-circle-outline' },
  CLOSED: { label: 'Closed', color: '#111827', icon: 'lock-outline' },
};

export const ISSUE_PRIORITIES = {
  LOW: { label: 'Low', color: COLORS.severityLow, score: 1 },
  MEDIUM: { label: 'Medium', color: COLORS.severityMedium, score: 2 },
  HIGH: { label: 'High', color: COLORS.severityHigh, score: 3 },
  CRITICAL: { label: 'Critical', color: COLORS.severityCritical, score: 4 },
};

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3000/api',
  TIMEOUT: 10000,
};
