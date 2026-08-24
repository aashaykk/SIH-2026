/**
 * Mock data shape tests.
 * Ensures mock data matches TypeScript types — catches
 * drift when types change but mocks are not updated.
 */
import { describe, it, expect } from 'vitest'
import { MOCK_INCIDENTS, MOCK_WARD_STATS, MOCK_DEPARTMENT_STATS, MOCK_HOTSPOTS } from '../utils/mockData'

describe('MOCK_INCIDENTS', () => {
  it('all incidents have required fields', () => {
    MOCK_INCIDENTS.forEach(inc => {
      expect(inc.id).toBeTruthy()
      expect(inc.title).toBeTruthy()
      expect(inc.category).toBeTruthy()
      expect(inc.status).toBeTruthy()
      expect(inc.priority).toBeTruthy()
      expect(typeof inc.priorityScore).toBe('number')
      expect(Array.isArray(inc.priorityReasons)).toBe(true)
      expect(typeof inc.latitude).toBe('number')
      expect(typeof inc.longitude).toBe('number')
      expect(typeof inc.aiConfidence).toBe('number')
    })
  })

  it('coordinates are valid for Gandhinagar area', () => {
    MOCK_INCIDENTS.forEach(inc => {
      expect(inc.latitude).toBeGreaterThan(22)
      expect(inc.latitude).toBeLessThan(25)
      expect(inc.longitude).toBeGreaterThan(70)
      expect(inc.longitude).toBeLessThan(75)
    })
  })

  it('SLA remainingMs sign matches slaStatus', () => {
    MOCK_INCIDENTS.forEach(inc => {
      if (inc.slaStatus === 'OVERDUE') {
        expect(inc.slaRemainingMs).toBeLessThanOrEqual(0)
      }
    })
  })

  it('aiConfidence is between 0 and 1', () => {
    MOCK_INCIDENTS.forEach(inc => {
      expect(inc.aiConfidence).toBeGreaterThanOrEqual(0)
      expect(inc.aiConfidence).toBeLessThanOrEqual(1)
    })
  })
})

describe('MOCK_WARD_STATS', () => {
  it('civicHealthScore is between 0 and 100', () => {
    expect(MOCK_WARD_STATS.civicHealthScore).toBeGreaterThanOrEqual(0)
    expect(MOCK_WARD_STATS.civicHealthScore).toBeLessThanOrEqual(100)
  })

  it('slaComplianceRate is between 0 and 1', () => {
    expect(MOCK_WARD_STATS.slaComplianceRate).toBeGreaterThanOrEqual(0)
    expect(MOCK_WARD_STATS.slaComplianceRate).toBeLessThanOrEqual(1)
  })
})

describe('MOCK_DEPARTMENT_STATS', () => {
  it('has at least 3 departments', () => {
    expect(MOCK_DEPARTMENT_STATS.length).toBeGreaterThanOrEqual(3)
  })

  it('each dept has non-negative counts', () => {
    MOCK_DEPARTMENT_STATS.forEach(d => {
      expect(d.open).toBeGreaterThanOrEqual(0)
      expect(d.overdue).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('MOCK_HOTSPOTS', () => {
  it('confidence is between 0 and 1', () => {
    MOCK_HOTSPOTS.forEach(h => {
      expect(h.confidence).toBeGreaterThanOrEqual(0)
      expect(h.confidence).toBeLessThanOrEqual(1)
    })
  })

  it('has predictedDays array', () => {
    MOCK_HOTSPOTS.forEach(h => {
      expect(Array.isArray(h.predictedDays)).toBe(true)
      expect(h.predictedDays.length).toBeGreaterThan(0)
    })
  })
})
