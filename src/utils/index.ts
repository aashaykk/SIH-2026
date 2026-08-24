/**
 * Shared utility functions for NAGAR-X dashboard.
 * Pure functions — no side effects, no imports from app code.
 * All are individually testable.
 */

import { formatDistanceToNow, format, isPast } from 'date-fns'
import type { PriorityLevel, SLAStatus, IssueCategory, DepartmentName, IncidentStatus } from '../types'

// ─── SLA ─────────────────────────────────────────────────────────────────────

/**
 * Calculate SLA status from remaining time.
 * GREEN: >40% remaining | YELLOW: 10–40% | RED: <10% | OVERDUE: past deadline
 */
export function getSLAStatus(remainingMs: number, totalMs: number): SLAStatus {
  if (remainingMs <= 0) return 'OVERDUE'
  const pct = remainingMs / totalMs
  if (pct > 0.4) return 'GREEN'
  if (pct > 0.1) return 'YELLOW'
  return 'RED'
}

/** Format milliseconds as "4h 21m" or "2d 3h" */
export function formatDuration(ms: number): string {
  const absMs = Math.abs(ms)
  const minutes = Math.floor(absMs / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const rem = { h: hours % 24, m: minutes % 60 }

  if (days > 0) return `${days}d ${rem.h}h`
  if (hours > 0) return `${hours}h ${rem.m}m`
  return `${minutes}m`
}

/** Returns CSS class string for SLA badge */
export function getSLAColorClass(status: SLAStatus): string {
  const map: Record<SLAStatus, string> = {
    GREEN: 'text-sla-green bg-green-950 border-green-800',
    YELLOW: 'text-sla-yellow bg-amber-950 border-amber-800',
    RED: 'text-sla-red bg-red-950 border-red-800 sla-critical',
    OVERDUE: 'text-red-300 bg-red-950 border-red-700 sla-critical',
  }
  return map[status]
}

// ─── Priority ─────────────────────────────────────────────────────────────────

export function getPriorityColorClass(priority: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    LOW: 'text-green-400 bg-green-950 border-green-800',
    MEDIUM: 'text-amber-400 bg-amber-950 border-amber-800',
    HIGH: 'text-orange-400 bg-orange-950 border-orange-800',
    CRITICAL: 'text-red-400 bg-red-950 border-red-800',
  }
  return map[priority]
}

export function getPriorityDotColor(priority: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    LOW: '#22C55E',
    MEDIUM: '#F59E0B',
    HIGH: '#F97316',
    CRITICAL: '#EF4444',
  }
  return map[priority]
}

// ─── Category / Department display ───────────────────────────────────────────

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  GARBAGE: '🗑️ Garbage',
  POTHOLE: '🕳️ Pothole',
  WATER_LEAKAGE: '💧 Water Leakage',
  BROKEN_STREETLIGHT: '💡 Broken Streetlight',
  OPEN_DRAIN: '🚰 Open Drain',
  SEWAGE: '⚠️ Sewage',
  DAMAGED_FOOTPATH: '🚶 Damaged Footpath',
  ILLEGAL_DUMPING: '🚫 Illegal Dumping',
  STRAY_ANIMAL: '🐕 Stray Animal',
  OTHER: '📋 Other',
}

export const DEPARTMENT_LABELS: Record<DepartmentName, string> = {
  SANITATION: 'Sanitation',
  ROADS: 'Roads',
  WATER_SUPPLY: 'Water Supply',
  ELECTRICAL: 'Electrical',
  DRAINAGE: 'Drainage',
  INFRASTRUCTURE: 'Infrastructure',
  ANIMAL_CONTROL: 'Animal Control',
}

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  REPORTED: 'Reported',
  ACKNOWLEDGED: 'Acknowledged',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WORK_COMPLETED: 'Work Completed',
  VERIFIED: 'Verified',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function timeAgo(isoString: string): string {
  try {
    return formatDistanceToNow(new Date(isoString), { addSuffix: true })
  } catch {
    return 'Unknown time'
  }
}

export function formatDateTime(isoString: string): string {
  try {
    return format(new Date(isoString), 'dd MMM yyyy, HH:mm')
  } catch {
    return 'Invalid date'
  }
}

export function isOverdue(deadline: string): boolean {
  try {
    return isPast(new Date(deadline))
  } catch {
    return false
  }
}

// ─── Misc ────────────────────────────────────────────────────────────────────

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/** Format confidence score as percentage string */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

/** Map civicHealthScore to color */
export function healthScoreColor(score: number): string {
  if (score >= 70) return '#22C55E'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}
