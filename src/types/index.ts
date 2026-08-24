/**
 * NAGAR-X Type Definitions — Single source of truth
 * Keep in sync with: backend/prisma/schema.prisma + mobile/src/types/index.ts
 */

export type UserRole = 'CITIZEN' | 'FIELD_WORKER' | 'DEPARTMENT_SUPERVISOR' | 'WARD_AUTHORITY' | 'CITY_ADMIN'
export type IncidentStatus = 'REPORTED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'WORK_COMPLETED' | 'VERIFIED' | 'CLOSED' | 'REOPENED'
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IssueCategory = 'GARBAGE' | 'POTHOLE' | 'WATER_LEAKAGE' | 'BROKEN_STREETLIGHT' | 'OPEN_DRAIN' | 'SEWAGE' | 'DAMAGED_FOOTPATH' | 'ILLEGAL_DUMPING' | 'STRAY_ANIMAL' | 'OTHER'
export type DepartmentName = 'SANITATION' | 'ROADS' | 'WATER_SUPPLY' | 'ELECTRICAL' | 'DRAINAGE' | 'INFRASTRUCTURE' | 'ANIMAL_CONTROL'
export type SLAStatus = 'GREEN' | 'YELLOW' | 'RED' | 'OVERDUE'

export interface User {
  id: string; name: string; email: string; role: UserRole
  wardId?: string; departmentId?: string; avatarUrl?: string; createdAt: string
}

export interface Ward {
  id: string; name: string; authorityId: string; authorityName: string
  civicHealthScore: number; civicHealthTrend: number
}

export interface Department {
  id: string; name: DepartmentName; displayName: string
  openCount: number; inProgressCount: number; overdueCount: number
  supervisorId?: string; supervisorName?: string
}

export interface FieldWorker {
  id: string; userId: string; name: string; phone: string
  departmentId: string; departmentName: DepartmentName
  wardId: string; isActive: boolean; currentTaskCount: number
}

export interface Incident {
  id: string; title: string; description: string
  category: IssueCategory; status: IncidentStatus
  priority: PriorityLevel; priorityScore: number; priorityReasons: string[]
  latitude: number; longitude: number; address: string
  wardId: string; wardName: string; departmentId: string; departmentName: DepartmentName
  beforeImageUrl?: string; afterImageUrl?: string
  reportCount: number; uniqueReporterCount: number; civicSignalStrength: number
  assignedWorkerId?: string; assignedWorkerName?: string
  slaDeadline: string; slaStatus: SLAStatus; slaRemainingMs: number; slaTotalMs: number
  aiConfidence: number; aiAnalysisId?: string
  createdAt: string; updatedAt: string
  acknowledgedAt?: string; assignedAt?: string; startedAt?: string
  resolvedAt?: string; closedAt?: string
}

export interface IncidentTimeline {
  id: string; incidentId: string; event: string; description: string
  actor: string; actorType: 'AI' | 'SYSTEM' | 'USER'
  metadata?: Record<string, unknown>; createdAt: string
}

export interface AIActivityEvent {
  id: string; timestamp: string; agent: string; message: string
  type: 'info' | 'success' | 'warning' | 'error'
  incidentId?: string; metadata?: Record<string, unknown>
}

export interface WardDashboardStats {
  wardId: string; wardName: string; civicHealthScore: number; civicHealthTrend: number
  totalOpen: number; critical: number; high: number; medium: number; low: number
  overdue: number; atRisk: number; resolvedToday: number
  avgResolutionHours: number; slaComplianceRate: number
}

export interface DepartmentStats {
  departmentId: string; departmentName: DepartmentName; displayName: string
  open: number; inProgress: number; overdue: number
  resolvedToday: number; slaComplianceRate: number
}

export interface HotspotPrediction {
  id: string; latitude: number; longitude: number; address: string
  category: IssueCategory; wardId: string; occurrenceCount: number
  predictedDays: string[]; predictedTimeWindow: string
  confidence: number; recommendedAction: string
}

export interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; pageSize: number; hasMore: boolean
}

export interface ApiError {
  message: string; code: string; statusCode: number
  details?: Record<string, string[]>
}

export interface IncidentFilters {
  status?: IncidentStatus[]; priority?: PriorityLevel[]
  category?: IssueCategory[]; departmentId?: string
  wardId?: string; slaStatus?: SLAStatus[]
  search?: string; page?: number; pageSize?: number
  sortBy?: 'createdAt' | 'priorityScore' | 'slaDeadline'
  sortOrder?: 'asc' | 'desc'
}

export interface ResolutionVerification {
  incidentId: string; resolved: boolean; confidence: number; reasons: string[]
  beforeImageUrl: string; afterImageUrl: string; verifiedAt: string
}
