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

export type IncidentStatus = 
  | 'PROCESSING' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLUTION_SUBMITTED' 
  | 'VERIFICATION_REQUIRED' 
  | 'CLOSED' 
  | 'REVIEW_REQUIRED' 
  | 'REOPENED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PriorityInfo {
  score: number;
  level: PriorityLevel;
}

export interface TimelineStep {
  label: string;
  status: 'done' | 'active' | 'pending';
  timestamp?: string;
}

export interface Resolution {
  beforeImage: string;
  afterImage: string;
  aiConfidence: number;
  verificationStatus: 'verified' | 'low_confidence' | 'manual_review';
  verificationReasons: string[];
  citizenVerification?: 'YES' | 'PARTIAL' | 'NO';
}

export interface Incident {
  id: string;
  title?: string;
  description?: string;
  category: string;
  status: IncidentStatus;
  priority: PriorityInfo;
  ward: string;
  department: string;
  reportsCount: number;
  timeline: TimelineStep[];
  resolution?: Resolution;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  slaDeadline?: string;
  locationName?: string;
}

export type NotificationType = 
  | 'report_assigned'
  | 'worker_started'
  | 'resolution_submitted'
  | 'verification_required'
  | 'issue_closed'
  | 'issue_reopened'
  | 'STATUS_UPDATE'
  | 'VERIFICATION_REQUEST'
  | 'GENERAL';

export interface CitizenNotification {
  id: string;
  incidentId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

// Backward compatibility alias for existing code
export type IssueStatus = IncidentStatus;
export type IssuePriority = PriorityLevel;
export type Issue = Incident;

