/**
 * Core Data Models & Schemas for NAGAR-X
 * Aligned strictly with backend API contracts
 */

export type UserRole = 'CITIZEN' | 'OFFICER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type IssueStatus = 
  | 'REPORTED' 
  | 'ACKNOWLEDGED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'VERIFIED' 
  | 'REOPENED';

export type IssueCategory = 
  | 'ROAD_DAMAGE' 
  | 'GARBAGE' 
  | 'STREETLIGHT' 
  | 'WATER_LEAKAGE' 
  | 'OTHER';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Department = 'ROADS' | 'SANITATION' | 'ELECTRICAL' | 'WATER' | 'GENERAL';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  priority: IssuePriority;
  status: IssueStatus;
  imageUrl?: string | null;
  latitude: number;
  longitude: number;
  reportCount: number;
  department?: Department | null;
  assignedOfficer?: string | null;
  aiConfidence?: number | null;
  slaDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Authentication API contracts
export interface AuthData {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

