import { DESTINATIONS, WINDOWS } from '../data/index.js'
import { diffDays } from './dates.js'

export function scoreDestination(dest, startDate, endDate) {
  const days = diffDays(startDate, endDate)
  const isLong = days >= 7
  const weights = isLong
    ? { weather: 0.30, crowds: 0.25, cost: 0.25, familyFit: 0.20 }
    : { weather: 0.35, crowds: 0.15, cost: 0.15, familyFit: 0.35 }

  const months = []
  const d = new Date(startDate)
  while (d <= endDate) {
    const m = d.getMonth()
    if (months.length === 0 || months[months.length - 1] !== m) months.push(m)
    d.setDate(d.getDate() + 1)
  }

  let totals = { weather: 0, crowds: 0, cost: 0, familyFit: 0 }
  for (const m of months) {
    const md = dest.months[m]
    totals.weather += md.weather
    totals.crowds += md.crowds
    totals.cost += md.cost
    totals.familyFit += md.familyFit
  }
  const n = months.length
  const avg = {
    weather: totals.weather / n,
    crowds: totals.crowds / n,
    cost: totals.cost / n,
    familyFit: totals.familyFit / n,
  }

  const weighted = avg.weather * weights.weather + avg.crowds * weights.crowds
    + avg.cost * weights.cost + avg.familyFit * weights.familyFit
  const pct = Math.round((weighted / 5) * 100)

  let durationFit = 'good'
  let durationNote = ''
  if (days < dest.minDays) {
    durationFit = 'short'
    durationNote = `Ideally ${dest.minDays}+ days`
  } else if (days >= dest.idealDays) {
    durationFit = 'ideal'
    durationNote = 'Great trip length'
  }

  const highlights = months.map(m => dest.months[m].notes)

  return { dest, score: pct, avg, durationFit, durationNote, highlights, months, days }
}

export function rankDestinations(startDate, endDate) {
  return DESTINATIONS
    .map(d => scoreDestination(d, startDate, endDate))
    .sort((a, b) => b.score - a.score)
}

export function bestWindows(destId) {
  const dest = DESTINATIONS.find(d => d.id === destId)
  if (!dest) return []
  return WINDOWS
    .map(w => {
      const start = w.start
      const end = w.end
      const result = scoreDestination(dest, start, end)
      return { ...result, window: w }
    })
    .sort((a, b) => b.score - a.score)
}
