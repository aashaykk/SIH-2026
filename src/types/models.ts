/**
 * Core Data Models & Schemas for NAGAR-X
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'officer' | 'worker';
  createdAt?: string;
}

export type IssueStatus = 
  | 'SUBMITTED' 
  | 'PENDING_SYNC' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'REOPENED' 
  | 'CLOSED';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  timestamp?: number;
}

export interface LocationInfo extends LocationCoordinate {
  addressName?: string; // Human readable location details
}

export interface AIAnalysis {
  category: string;
  confidenceScore: number; // 0 to 1
  detectedPriority: IssuePriority;
  isDuplicate: boolean;
  duplicateIssueId?: string | null;
  rawAIResponse?: any;
}

export interface ResolutionVerification {
  isVerified: boolean; // Citizen confirms resolution
  citizenComments?: string;
  afterImageUrl?: string;
  verifiedAt?: string;
  workerFeedback?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string; // matches CIVIC_CATEGORIES
  priority: IssuePriority;
  status: IssueStatus;
  imageUrl?: string;
  voiceUrl?: string; // audio memo url
  location: LocationInfo;
  
  // Timeline information
  createdAt: string;
  updatedAt: string;
  
  // Staff assignments
  assignedDepartment?: string;
  assignedOfficer?: string;
  assignedWorker?: string;
  
  // Custom features
  aiAnalysis?: AIAnalysis;
  verification?: ResolutionVerification;
}
