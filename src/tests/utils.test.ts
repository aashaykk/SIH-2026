/**
 * Utils unit tests — pure functions, no mocks needed.
 *
 * Tests cover: happy path, boundary conditions, and failure/edge cases.
 */
import { describe, it, expect } from 'vitest'
import {
  getSLAStatus, formatDuration, getPriorityColorClass,
  formatConfidence, truncate, healthScoreColor, timeAgo
} from '../utils'

// ─── getSLAStatus ─────────────────────────────────────────────────────────────
describe('getSLAStatus', () => {
  const total = 24 * 3_600_000 // 24h in ms

  it('returns GREEN when >40% remaining', () => {
    expect(getSLAStatus(total * 0.5, total)).toBe('GREEN')
    expect(getSLAStatus(total, total)).toBe('GREEN') // exactly 100%
  })

  it('returns YELLOW when 10–40% remaining', () => {
    expect(getSLAStatus(total * 0.3, total)).toBe('YELLOW')
    expect(getSLAStatus(total * 0.11, total)).toBe('YELLOW')
  })

  it('returns RED when <10% remaining', () => {
    expect(getSLAStatus(total * 0.05, total)).toBe('RED')
    expect(getSLAStatus(1, total)).toBe('RED')
  })

  it('returns OVERDUE when remaining is 0', () => {
    expect(getSLAStatus(0, total)).toBe('OVERDUE')
  })

  it('returns OVERDUE when remaining is negative', () => {
    expect(getSLAStatus(-3_600_000, total)).toBe('OVERDUE')
  })

  it('handles edge: total = 0 (misconfigured SLA rule)', () => {
    // Should not throw; result is technically Infinity% so GREEN
    expect(() => getSLAStatus(1000, 0)).not.toThrow()
  })
})

// ─── formatDuration ───────────────────────────────────────────────────────────
describe('formatDuration', () => {
  it('formats minutes correctly', () => {
    expect(formatDuration(45 * 60_000)).toBe('45m')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(4 * 3_600_000 + 21 * 60_000)).toBe('4h 21m')
  })

  it('formats days and hours', () => {
    expect(formatDuration(2 * 86_400_000 + 3 * 3_600_000)).toBe('2d 3h')
  })

  it('handles negative (overdue) durations using absolute value', () => {
    expect(formatDuration(-4 * 3_600_000)).toBe('4h 0m')
  })

  it('handles 0ms', () => {
    expect(formatDuration(0)).toBe('0m')
  })
})

// ─── getPriorityColorClass ────────────────────────────────────────────────────
describe('getPriorityColorClass', () => {
  it('returns a non-empty string for each priority level', () => {
    const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
    levels.forEach(level => {
      const result = getPriorityColorClass(level)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  it('CRITICAL gets red class', () => {
    expect(getPriorityColorClass('CRITICAL')).toContain('red')
  })

  it('LOW gets green class', () => {
    expect(getPriorityColorClass('LOW')).toContain('green')
  })
})

// ─── formatConfidence ─────────────────────────────────────────────────────────
describe('formatConfidence', () => {
  it('formats 0.96 as 96%', () => {
    expect(formatConfidence(0.96)).toBe('96%')
  })

  it('formats 1.0 as 100%', () => {
    expect(formatConfidence(1.0)).toBe('100%')
  })

  it('formats 0 as 0%', () => {
    expect(formatConfidence(0)).toBe('0%')
  })

  it('rounds correctly', () => {
    expect(formatConfidence(0.956)).toBe('96%')
    expect(formatConfidence(0.954)).toBe('95%')
  })
})

// ─── truncate ─────────────────────────────────────────────────────────────────
describe('truncate', () => {
  it('does not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('truncates and adds ellipsis', () => {
    const result = truncate('Water leakage near main road junction', 20)
    expect(result.length).toBe(20)
    expect(result.endsWith('...')).toBe(true)
  })

  it('handles exact length boundary', () => {
    expect(truncate('abc', 3)).toBe('abc') // no truncation at exact limit
  })
})

// ─── healthScoreColor ─────────────────────────────────────────────────────────
describe('healthScoreColor', () => {
  it('returns green for score ≥ 70', () => {
    expect(healthScoreColor(78)).toBe('#22C55E')
    expect(healthScoreColor(70)).toBe('#22C55E')
    expect(healthScoreColor(100)).toBe('#22C55E')
  })

  it('returns amber for score 40–69', () => {
    expect(healthScoreColor(55)).toBe('#F59E0B')
    expect(healthScoreColor(40)).toBe('#F59E0B')
  })

  it('returns red for score < 40', () => {
    expect(healthScoreColor(39)).toBe('#EF4444')
    expect(healthScoreColor(0)).toBe('#EF4444')
  })
})

// ─── timeAgo ─────────────────────────────────────────────────────────────────
describe('timeAgo', () => {
  it('returns a string for a valid ISO date', () => {
    const result = timeAgo(new Date(Date.now() - 3_600_000).toISOString())
    expect(typeof result).toBe('string')
    expect(result).toContain('ago')
  })

  it('returns "Unknown time" for an invalid date string', () => {
    expect(timeAgo('not-a-date')).toBe('Unknown time')
  })
})
