import { describe, it, expect } from 'vitest'
import { scoreDestination, rankDestinations } from './scoring.js'
import { DESTINATIONS } from '../data/index.js'

describe('scoreDestination', () => {
  it('returns a score and averages for a known window', () => {
    const rome = DESTINATIONS.find(d => d.id === 'rome')
    const start = new Date(2026, 8, 5)
    const end = new Date(2026, 8, 7)
    const r = scoreDestination(rome, start, end)
    expect(typeof r.score).toBe('number')
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.avg.weather).toBeGreaterThan(0)
    expect(r.highlights.length).toBeGreaterThan(0)
  })
})

describe('rankDestinations', () => {
  it('sorts destinations by score descending', () => {
    const start = new Date(2026, 8, 5)
    const end = new Date(2026, 8, 7)
    const ranked = rankDestinations(start, end)
    expect(ranked.length).toBe(DESTINATIONS.length)
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score)
    }
  })
})
