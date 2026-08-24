/**
 * NAGAR-X Demo / Mock Data
 * ========================
 * Used in two scenarios:
 * 1. Development before backend is ready (VITE_USE_MOCK=true)
 * 2. Demo fallback if backend is unreachable
 *
 * All coordinates are around Gandhinagar / Ahmedabad area (Gujarat)
 * matching the screenshot's INFOCITY / Kudasan area.
 *
 * DO NOT use this in production. The API service layer swaps this out.
 */

import type {
  Incident, WardDashboardStats, DepartmentStats,
  HotspotPrediction, AIActivityEvent, FieldWorker
} from '../types'

export const MOCK_WARD_STATS: WardDashboardStats = {
  wardId: 'ward-17',
  wardName: 'Ward 17 — Kudasan',
  civicHealthScore: 78,
  civicHealthTrend: 8,
  totalOpen: 128,
  critical: 7,
  high: 23,
  medium: 54,
  low: 44,
  overdue: 23,
  atRisk: 14,
  resolvedToday: 36,
  avgResolutionHours: 18.4,
  slaComplianceRate: 0.82,
}

const now = new Date()
const h = (hours: number) => new Date(now.getTime() + hours * 3_600_000).toISOString()
const hPast = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString()

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-1042',
    title: 'Garbage Accumulation Near Market',
    description: 'Large pile of uncollected garbage near Dholeshwar Market. Multiple bags piled up for 3 days. Strong odour affecting nearby shops.',
    category: 'GARBAGE',
    status: 'ASSIGNED',
    priority: 'HIGH',
    priorityScore: 87,
    priorityReasons: ['8 citizens reported this issue', 'Unresolved for 18 hours', 'Reports are increasing', 'Located near commercial area'],
    latitude: 23.2078, longitude: 72.6397,
    address: 'Dholeshwar Market, Kudasan, Gandhinagar',
    wardId: 'ward-17', wardName: 'Ward 17',
    departmentId: 'dept-sanitation', departmentName: 'SANITATION',
    beforeImageUrl: 'https://placehold.co/400x300/1E293B/F97316?text=Garbage+Before',
    reportCount: 8, uniqueReporterCount: 7, civicSignalStrength: 91,
    assignedWorkerId: 'w-001', assignedWorkerName: 'Rahul Patel',
    slaDeadline: h(4), slaStatus: 'YELLOW',
    slaRemainingMs: 4 * 3_600_000, slaTotalMs: 24 * 3_600_000,
    aiConfidence: 0.96, aiAnalysisId: 'ai-001',
    createdAt: hPast(18), updatedAt: hPast(1),
    assignedAt: hPast(1),
  },
  {
    id: 'INC-1039',
    title: 'Water Leakage Near Main Road',
    description: 'Burst pipe causing water wastage on Gandhinagar Bypass Road. Water logging on footpath.',
    category: 'WATER_LEAKAGE',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    priorityScore: 95,
    priorityReasons: ['Safety hazard — road slippery', '12 citizens reported', 'SLA breach imminent', 'Near school zone'],
    latitude: 23.2156, longitude: 72.6369,
    address: 'Gandhinagar Bypass Rd, near Superspeciality Hospital',
    wardId: 'ward-17', wardName: 'Ward 17',
    departmentId: 'dept-water', departmentName: 'WATER_SUPPLY',
    beforeImageUrl: 'https://placehold.co/400x300/1E293B/3B82F6?text=Water+Leak',
    reportCount: 12, uniqueReporterCount: 10, civicSignalStrength: 97,
    assignedWorkerId: 'w-003', assignedWorkerName: 'Suresh Kumar',
    slaDeadline: h(1), slaStatus: 'RED',
    slaRemainingMs: 3_600_000, slaTotalMs: 4 * 3_600_000,
    aiConfidence: 0.92, aiAnalysisId: 'ai-003',
    createdAt: hPast(6), updatedAt: hPast(0.5),
    assignedAt: hPast(3), startedAt: hPast(1),
  },
  {
    id: 'INC-1035',
    title: 'Pothole on Service Road',
    description: 'Large pothole near Serene Garden Restaurant. Vehicles swerving dangerously.',
    category: 'POTHOLE',
    status: 'REPORTED',
    priority: 'MEDIUM',
    priorityScore: 54,
    priorityReasons: ['3 citizens reported', 'Traffic hazard', 'Recently created'],
    latitude: 23.1990, longitude: 72.6310,
    address: 'Service Road, Urjan, Gandhinagar',
    wardId: 'ward-17', wardName: 'Ward 17',
    departmentId: 'dept-roads', departmentName: 'ROADS',
    reportCount: 3, uniqueReporterCount: 3, civicSignalStrength: 42,
    slaDeadline: h(20), slaStatus: 'GREEN',
    slaRemainingMs: 20 * 3_600_000, slaTotalMs: 24 * 3_600_000,
    aiConfidence: 0.88, aiAnalysisId: 'ai-005',
    createdAt: hPast(4), updatedAt: hPast(4),
  },
  {
    id: 'INC-1028',
    title: 'Broken Streetlight at Roundabout',
    description: 'Street lamp not working near Infocity roundabout. Area is dark at night.',
    category: 'BROKEN_STREETLIGHT',
    status: 'OVERDUE' as never, // demo
    priority: 'HIGH',
    priorityScore: 72,
    priorityReasons: ['Safety concern at night', 'SLA breached 4 hours ago', '5 complaints'],
    latitude: 23.2201, longitude: 72.6420,
    address: 'Infocity Roundabout, Gandhinagar',
    wardId: 'ward-17', wardName: 'Ward 17',
    departmentId: 'dept-electrical', departmentName: 'ELECTRICAL',
    reportCount: 5, uniqueReporterCount: 5, civicSignalStrength: 68,
    slaDeadline: hPast(4), slaStatus: 'OVERDUE',
    slaRemainingMs: -4 * 3_600_000, slaTotalMs: 24 * 3_600_000,
    aiConfidence: 0.91,
    createdAt: hPast(28), updatedAt: hPast(4),
  },
  {
    id: 'INC-1055',
    title: 'Open Drain Near Residential Block',
    description: 'Drain cover missing. Children in area at risk of falling in.',
    category: 'OPEN_DRAIN',
    status: 'ACKNOWLEDGED',
    priority: 'CRITICAL',
    priorityScore: 91,
    priorityReasons: ['Child safety hazard', '6 citizen reports', 'Monsoon season risk'],
    latitude: 23.2090, longitude: 72.6350,
    address: 'Block 12, Kudasan Residential, Ward 17',
    wardId: 'ward-17', wardName: 'Ward 17',
    departmentId: 'dept-drainage', departmentName: 'DRAINAGE',
    reportCount: 6, uniqueReporterCount: 6, civicSignalStrength: 88,
    slaDeadline: h(2), slaStatus: 'RED',
    slaRemainingMs: 2 * 3_600_000, slaTotalMs: 4 * 3_600_000,
    aiConfidence: 0.94,
    createdAt: hPast(2), updatedAt: hPast(0.5),
    acknowledgedAt: hPast(0.5),
  },
]

export const MOCK_DEPARTMENT_STATS: DepartmentStats[] = [
  { departmentId: 'dept-sanitation', departmentName: 'SANITATION', displayName: 'Sanitation', open: 42, inProgress: 8, overdue: 7, resolvedToday: 14, slaComplianceRate: 0.78 },
  { departmentId: 'dept-roads', departmentName: 'ROADS', displayName: 'Roads', open: 31, inProgress: 5, overdue: 6, resolvedToday: 9, slaComplianceRate: 0.81 },
  { departmentId: 'dept-water', departmentName: 'WATER_SUPPLY', displayName: 'Water Supply', open: 18, inProgress: 3, overdue: 4, resolvedToday: 7, slaComplianceRate: 0.85 },
  { departmentId: 'dept-electrical', departmentName: 'ELECTRICAL', displayName: 'Electrical', open: 14, inProgress: 2, overdue: 3, resolvedToday: 4, slaComplianceRate: 0.79 },
  { departmentId: 'dept-drainage', departmentName: 'DRAINAGE', displayName: 'Drainage', open: 23, inProgress: 4, overdue: 3, resolvedToday: 2, slaComplianceRate: 0.88 },
]

export const MOCK_HOTSPOTS: HotspotPrediction[] = [
  {
    id: 'hs-001', latitude: 23.2078, longitude: 72.6397,
    address: 'Dholeshwar Market, Kudasan',
    category: 'GARBAGE', wardId: 'ward-17', occurrenceCount: 28,
    predictedDays: ['Sunday', 'Monday'],
    predictedTimeWindow: '11 AM – 2 PM',
    confidence: 0.82,
    recommendedAction: 'Deploy sanitation vehicle at 10:30 AM on Sundays',
  },
  {
    id: 'hs-002', latitude: 23.2156, longitude: 72.6310,
    address: 'Service Road near Ayunam Rd Junction',
    category: 'POTHOLE', wardId: 'ward-17', occurrenceCount: 15,
    predictedDays: ['Monday', 'Tuesday'],
    predictedTimeWindow: '7 AM – 10 AM',
    confidence: 0.71,
    recommendedAction: 'Schedule road repair crew before monsoon peak',
  },
]

export const MOCK_AI_EVENTS: AIActivityEvent[] = [
  { id: 'e1', timestamp: new Date(now.getTime() - 5000).toISOString(), agent: 'Vision Agent', message: 'Garbage detected — 96% confidence', type: 'success', incidentId: 'INC-1042' },
  { id: 'e2', timestamp: new Date(now.getTime() - 4500).toISOString(), agent: 'Location Agent', message: 'Ward 17 identified via GPS point-in-polygon', type: 'info', incidentId: 'INC-1042' },
  { id: 'e3', timestamp: new Date(now.getTime() - 4000).toISOString(), agent: 'Dedup Agent', message: '5 related reports found — similarity 92% — merged into INC-1042', type: 'warning', incidentId: 'INC-1042' },
  { id: 'e4', timestamp: new Date(now.getTime() - 3500).toISOString(), agent: 'Priority Agent', message: 'HIGH priority assigned — score 87/100', type: 'success', incidentId: 'INC-1042' },
  { id: 'e5', timestamp: new Date(now.getTime() - 3000).toISOString(), agent: 'Routing Agent', message: 'Routed to SANITATION department', type: 'info', incidentId: 'INC-1042' },
  { id: 'e6', timestamp: new Date(now.getTime() - 2500).toISOString(), agent: 'SLA Agent', message: '24-hour SLA started — deadline set', type: 'info', incidentId: 'INC-1042' },
  { id: 'e7', timestamp: new Date(now.getTime() - 60000).toISOString(), agent: 'SLA Agent', message: 'CRITICAL INC-1039 — SLA at risk (85% elapsed)', type: 'error', incidentId: 'INC-1039' },
]

export const MOCK_WORKERS: FieldWorker[] = [
  { id: 'w-001', userId: 'u-101', name: 'Rahul Patel', phone: '+91 98765 00001', departmentId: 'dept-sanitation', departmentName: 'SANITATION', wardId: 'ward-17', isActive: true, currentTaskCount: 2 },
  { id: 'w-002', userId: 'u-102', name: 'Priya Sharma', phone: '+91 98765 00002', departmentId: 'dept-sanitation', departmentName: 'SANITATION', wardId: 'ward-17', isActive: true, currentTaskCount: 1 },
  { id: 'w-003', userId: 'u-103', name: 'Suresh Kumar', phone: '+91 98765 00003', departmentId: 'dept-water', departmentName: 'WATER_SUPPLY', wardId: 'ward-17', isActive: true, currentTaskCount: 1 },
]
