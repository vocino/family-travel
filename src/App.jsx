import React, { useState, useMemo, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom/client'

// ─── Theme ───────────────────────────────────────────────────────────────────
const BG      = '#0a0a0f'
const SURFACE = '#0f0f1a'
const BORDER  = '#1e1e2e'
const TEXT    = '#e8e4dc'
const MUTED   = '#5a5a7a'
const TEAL    = '#0d9488'
const RED     = '#dc2626'
const FONT    = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"

// ─── Destinations ─────────────────────────────────────────────────────────────
// Monthly scores (1–5) across four dimensions. Higher is better.
//   weather:    pleasant temps, low rain, comfortable humidity
//   crowds:     5 = uncrowded, 1 = peak tourist crush
//   cost:       5 = cheapest flights/hotels, 1 = peak pricing
//   familyFit:  kid-friendly seasonal events, school-break alignment, outdoor activity options
const DESTINATIONS = [
  {
    id: 'rome', name: 'Rome', country: 'Italy', emoji: '🏛',
    minDays: 5, idealDays: 8,
    months: [
      /* Jan */ { weather: 2, crowds: 4, cost: 4, familyFit: 2, notes: 'Cool and rainy, but museums are empty' },
      /* Feb */ { weather: 2, crowds: 4, cost: 4, familyFit: 2, notes: 'Carnival season, still chilly' },
      /* Mar */ { weather: 3, crowds: 3, cost: 3, familyFit: 3, notes: 'Warming up, Easter crowds possible' },
      /* Apr */ { weather: 4, crowds: 3, cost: 3, familyFit: 4, notes: 'Ideal temps, outdoor dining, spring blooms' },
      /* May */ { weather: 5, crowds: 3, cost: 3, familyFit: 5, notes: 'Best weather, great for walking with kids' },
      /* Jun */ { weather: 4, crowds: 2, cost: 2, familyFit: 4, notes: 'Getting hot, summer crowds arriving' },
      /* Jul */ { weather: 2, crowds: 1, cost: 1, familyFit: 2, notes: 'Extreme heat, peak crowds and prices' },
      /* Aug */ { weather: 2, crowds: 2, cost: 2, familyFit: 2, notes: 'Many locals leave, sweltering but some deals' },
      /* Sep */ { weather: 4, crowds: 3, cost: 3, familyFit: 4, notes: 'Heat breaks, shoulder season sweet spot' },
      /* Oct */ { weather: 4, crowds: 3, cost: 3, familyFit: 4, notes: 'Mild weather, harvest food festivals' },
      /* Nov */ { weather: 3, crowds: 4, cost: 4, familyFit: 3, notes: 'Cooler, uncrowded, good prices' },
      /* Dec */ { weather: 2, crowds: 3, cost: 3, familyFit: 3, notes: 'Christmas markets, festive but cold and rainy' },
    ],
  },
  {
    id: 'tokyo', name: 'Tokyo', country: 'Japan', emoji: '⛩',
    minDays: 7, idealDays: 12,
    months: [
      /* Jan */ { weather: 3, crowds: 4, cost: 3, familyFit: 3, notes: 'Cold but clear, New Year shrines' },
      /* Feb */ { weather: 3, crowds: 4, cost: 4, familyFit: 3, notes: 'Early plum blossoms, uncrowded' },
      /* Mar */ { weather: 4, crowds: 2, cost: 2, familyFit: 5, notes: 'Cherry blossom season — magical but popular' },
      /* Apr */ { weather: 5, crowds: 2, cost: 2, familyFit: 5, notes: 'Late sakura, perfect temps, parks are stunning' },
      /* May */ { weather: 4, crowds: 3, cost: 3, familyFit: 4, notes: 'Golden Week early May, then pleasant and calm' },
      /* Jun */ { weather: 2, crowds: 4, cost: 4, familyFit: 2, notes: 'Rainy season — humid, frequent downpours' },
      /* Jul */ { weather: 2, crowds: 3, cost: 3, familyFit: 3, notes: 'Hot and humid, but summer festivals and fireworks' },
      /* Aug */ { weather: 2, crowds: 3, cost: 2, familyFit: 3, notes: 'Peak heat, Obon holiday, some closures' },
      /* Sep */ { weather: 3, crowds: 4, cost: 4, familyFit: 3, notes: 'Typhoon risk, but crowds thin out' },
      /* Oct */ { weather: 5, crowds: 3, cost: 3, familyFit: 5, notes: 'Perfect weather, fall foliage begins' },
      /* Nov */ { weather: 4, crowds: 3, cost: 3, familyFit: 5, notes: 'Peak autumn colors, comfortable temps' },
      /* Dec */ { weather: 3, crowds: 3, cost: 3, familyFit: 4, notes: 'Holiday illuminations, winter markets, cool but clear' },
    ],
  },
  {
    id: 'london', name: 'London', country: 'UK', emoji: '🎡',
    minDays: 4, idealDays: 7,
    months: [
      /* Jan */ { weather: 1, crowds: 4, cost: 5, familyFit: 3, notes: 'Cold and dark, but cheapest flights and great museums' },
      /* Feb */ { weather: 1, crowds: 4, cost: 4, familyFit: 2, notes: 'Half-term crowds mid-month, otherwise quiet' },
      /* Mar */ { weather: 2, crowds: 3, cost: 3, familyFit: 3, notes: 'Warming slowly, daffodils in parks' },
      /* Apr */ { weather: 3, crowds: 3, cost: 3, familyFit: 4, notes: 'Spring arrives, longer days, Easter activities' },
      /* May */ { weather: 4, crowds: 3, cost: 3, familyFit: 4, notes: 'Pleasant, bank holidays, Chelsea Flower Show' },
      /* Jun */ { weather: 5, crowds: 2, cost: 2, familyFit: 5, notes: 'Best weather, longest days, outdoor everything' },
      /* Jul */ { weather: 4, crowds: 2, cost: 2, familyFit: 5, notes: 'Warm, parks alive, summer school holidays begin' },
      /* Aug */ { weather: 4, crowds: 2, cost: 2, familyFit: 4, notes: 'Warm but peak tourist season, Notting Hill Carnival' },
      /* Sep */ { weather: 3, crowds: 3, cost: 3, familyFit: 4, notes: 'Still pleasant, crowds ease, great shoulder month' },
      /* Oct */ { weather: 2, crowds: 3, cost: 3, familyFit: 3, notes: 'Autumn colors, half-term, getting dark early' },
      /* Nov */ { weather: 1, crowds: 4, cost: 4, familyFit: 3, notes: 'Bonfire Night, Christmas lights go up late month' },
      /* Dec */ { weather: 1, crowds: 3, cost: 3, familyFit: 4, notes: 'Christmas markets, pantomimes, festive atmosphere' },
    ],
  },
  {
    id: 'disneyland', name: 'Disneyland', country: 'USA', emoji: '🏰',
    minDays: 3, idealDays: 5,
    months: [
      /* Jan */ { weather: 4, crowds: 5, cost: 5, familyFit: 4, notes: 'Post-holiday lull — shortest waits of the year' },
      /* Feb */ { weather: 4, crowds: 4, cost: 4, familyFit: 4, notes: 'Low crowds except Presidents\' Day week' },
      /* Mar */ { weather: 4, crowds: 2, cost: 2, familyFit: 3, notes: 'Spring break rush begins mid-month' },
      /* Apr */ { weather: 4, crowds: 2, cost: 2, familyFit: 3, notes: 'Spring break crowds linger, Easter busy' },
      /* May */ { weather: 5, crowds: 3, cost: 3, familyFit: 5, notes: 'Great weather, lighter crowds before summer' },
      /* Jun */ { weather: 4, crowds: 1, cost: 1, familyFit: 3, notes: 'Summer surge starts — long lines, peak prices' },
      /* Jul */ { weather: 3, crowds: 1, cost: 1, familyFit: 2, notes: 'Peak everything — hot, packed, expensive' },
      /* Aug */ { weather: 3, crowds: 1, cost: 1, familyFit: 2, notes: 'Still peak — consider Halloween season late Aug' },
      /* Sep */ { weather: 4, crowds: 3, cost: 3, familyFit: 5, notes: 'Halloween overlay begins, crowds drop fast' },
      /* Oct */ { weather: 5, crowds: 3, cost: 3, familyFit: 5, notes: 'Oogie Boogie Bash, fall decorations, great temps' },
      /* Nov */ { weather: 4, crowds: 3, cost: 3, familyFit: 5, notes: 'Holiday season starts mid-Nov, festive but busy Thanksgiving' },
      /* Dec */ { weather: 3, crowds: 2, cost: 2, familyFit: 4, notes: 'Beautiful decorations, very crowded Christmas–New Year' },
    ],
  },
  {
    id: 'cancun', name: 'Cancún', country: 'Mexico', emoji: '🏖',
    minDays: 4, idealDays: 7,
    months: [
      /* Jan */ { weather: 4, crowds: 3, cost: 3, familyFit: 4, notes: 'Dry season, warm water, post-holiday value' },
      /* Feb */ { weather: 5, crowds: 3, cost: 3, familyFit: 4, notes: 'Perfect beach weather, whale sharks departing' },
      /* Mar */ { weather: 5, crowds: 1, cost: 1, familyFit: 2, notes: 'Spring break invasion — very crowded, not ideal for families' },
      /* Apr */ { weather: 5, crowds: 2, cost: 2, familyFit: 4, notes: 'Hot and dry, Semana Santa early month' },
      /* May */ { weather: 4, crowds: 4, cost: 4, familyFit: 4, notes: 'Hot, low crowds, rainy season just starting' },
      /* Jun */ { weather: 3, crowds: 4, cost: 4, familyFit: 3, notes: 'Hurricane season begins, afternoon storms' },
      /* Jul */ { weather: 3, crowds: 3, cost: 3, familyFit: 3, notes: 'Hot and humid, summer family travel picks up' },
      /* Aug */ { weather: 3, crowds: 3, cost: 3, familyFit: 3, notes: 'Peak hurricane risk, but good resort deals' },
      /* Sep */ { weather: 2, crowds: 5, cost: 5, familyFit: 2, notes: 'Hurricane peak, cheapest month, risky for travel' },
      /* Oct */ { weather: 3, crowds: 5, cost: 5, familyFit: 3, notes: 'Late hurricane season, Day of Dead prep, quiet' },
      /* Nov */ { weather: 4, crowds: 4, cost: 4, familyFit: 4, notes: 'Dry season returns, Day of the Dead, great value' },
      /* Dec */ { weather: 4, crowds: 2, cost: 2, familyFit: 4, notes: 'Holiday rush picks up, warm escape from winter' },
    ],
  },
  {
    id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', emoji: '🌋',
    minDays: 5, idealDays: 9,
    months: [
      /* Jan */ { weather: 1, crowds: 4, cost: 4, familyFit: 3, notes: 'Dark and cold, but northern lights and ice caves' },
      /* Feb */ { weather: 1, crowds: 4, cost: 4, familyFit: 3, notes: 'Northern lights season, days getting longer' },
      /* Mar */ { weather: 2, crowds: 3, cost: 3, familyFit: 3, notes: 'Still wintry, whale watching starts, aurora fading' },
      /* Apr */ { weather: 2, crowds: 3, cost: 3, familyFit: 3, notes: 'Snow melting, puffins arriving, shoulder pricing' },
      /* May */ { weather: 3, crowds: 3, cost: 3, familyFit: 4, notes: 'Midnight sun beginning, waterfalls at peak flow' },
      /* Jun */ { weather: 4, crowds: 2, cost: 1, familyFit: 5, notes: 'Midnight sun, 24hr daylight, peak hiking, puffins nesting' },
      /* Jul */ { weather: 4, crowds: 1, cost: 1, familyFit: 5, notes: 'Warmest month, busiest, endless daylight, whale watching peak' },
      /* Aug */ { weather: 4, crowds: 2, cost: 2, familyFit: 5, notes: 'Still warm-ish, puffins, crowds easing late month' },
      /* Sep */ { weather: 3, crowds: 3, cost: 3, familyFit: 4, notes: 'Northern lights return, fall colors, shoulder prices' },
      /* Oct */ { weather: 2, crowds: 4, cost: 4, familyFit: 3, notes: 'Getting dark and cold, aurora season, quiet' },
      /* Nov */ { weather: 1, crowds: 5, cost: 5, familyFit: 2, notes: 'Dark, stormy, cheapest month, ice caves opening' },
      /* Dec */ { weather: 1, crowds: 4, cost: 3, familyFit: 3, notes: 'Festive Reykjavik, northern lights, only ~4hrs daylight' },
    ],
  },
]

// ─── Seasonality Scoring ──────────────────────────────────────────────────────
// Weights shift based on trip length — longer trips make crowds/cost matter more
function scoreDestination(dest, startDate, endDate) {
  const days = diffDays(startDate, endDate)
  const isLong = days >= 7
  const weights = isLong
    ? { weather: 0.30, crowds: 0.25, cost: 0.25, familyFit: 0.20 }
    : { weather: 0.35, crowds: 0.15, cost: 0.15, familyFit: 0.35 }

  // Collect the months this trip spans
  const months = []
  const d = new Date(startDate)
  while (d <= endDate) {
    const m = d.getMonth()
    if (months.length === 0 || months[months.length - 1] !== m) months.push(m)
    d.setDate(d.getDate() + 1)
  }

  // Average scores across spanned months
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

  // Duration fit penalty/bonus
  let durationFit = 'good'
  let durationNote = ''
  if (days < dest.minDays) {
    durationFit = 'short'
    durationNote = `Ideally ${dest.minDays}+ days`
  } else if (days >= dest.idealDays) {
    durationFit = 'ideal'
    durationNote = 'Great trip length'
  }

  // Collect notes from the spanned months
  const highlights = months.map(m => dest.months[m].notes)

  return { dest, score: pct, avg, durationFit, durationNote, highlights, months, days }
}

function rankDestinations(startDate, endDate) {
  return DESTINATIONS
    .map(d => scoreDestination(d, startDate, endDate))
    .sort((a, b) => b.score - a.score)
}

function bestWindows(destId) {
  const dest = DESTINATIONS.find(d => d.id === destId)
  if (!dest) return []
  return WINDOWS
    .map(w => {
      const ext = { before: 0, after: 0 }
      const start = w.start
      const end = w.end
      const result = scoreDestination(dest, start, end)
      return { ...result, window: w }
    })
    .sort((a, b) => b.score - a.score)
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const WINDOWS = [
  {
    id: 'labor-day', title: 'Labor Day Weekend', section: 'free',
    start: new Date(2026, 8, 5), end: new Date(2026, 8, 7),
    basePto: 0, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'Work holiday Sep 7 + school off. Free long weekend.',
    color: '#0d9488',
  },
  {
    id: 'mlk', title: 'MLK Weekend', section: 'free',
    start: new Date(2027, 0, 16), end: new Date(2027, 0, 19),
    basePto: 0, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'School off Jan 18, work holiday Jan 19. Free 4-day weekend.',
    color: '#0d9488',
  },
  {
    id: 'presidents', title: "Presidents' Day Stretch", section: 'free',
    start: new Date(2027, 1, 12), end: new Date(2027, 1, 16),
    basePto: 0, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'School non-work day Feb 12, Presidents\u2019 Day Feb 15, work holiday Feb 16. Best free stretch.',
    color: '#0d9488',
  },
  {
    id: 'memorial', title: 'Memorial Day + Last Day', section: 'free',
    start: new Date(2027, 4, 29), end: new Date(2027, 4, 31),
    basePto: 0, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'Work holiday May 31 + school ends Jun 1. Summer kickoff.',
    color: '#0d9488',
  },
  {
    id: 'fall-recess', title: 'Fall Recess', section: 'pto',
    start: new Date(2026, 10, 21), end: new Date(2026, 10, 29),
    basePto: 2, maxExtendBefore: 3, maxExtendAfter: 3,
    note: 'School off Nov 23\u201327. Work covers Thanksgiving + day after. 2 PTO days = 10-day stretch.',
    color: '#2563eb',
  },
  {
    id: 'winter-min', title: 'Winter Break (minimal)', section: 'pto',
    start: new Date(2026, 11, 19), end: new Date(2027, 0, 4),
    basePto: 1, maxExtendBefore: 0, maxExtendAfter: 3,
    note: '1 PTO day (Dec 19 head start). School off Dec 21\u2013Jan 4. Work covers Dec 24, 25 & 31.',
    color: '#2563eb',
  },
  {
    id: 'winter-full', title: 'Winter Break (full dark)', section: 'pto',
    start: new Date(2026, 11, 19), end: new Date(2027, 0, 4),
    basePto: 6, maxExtendBefore: 0, maxExtendAfter: 3,
    note: '6 PTO days \u2014 fully offline both work weeks. Work covers Dec 24, 25 & 31.',
    color: '#7c3aed',
  },
  {
    id: 'spring', title: 'Spring Break', section: 'pto',
    start: new Date(2027, 2, 13), end: new Date(2027, 2, 21),
    basePto: 5, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'School off Mar 15\u201319. No work holidays \u2014 most PTO-expensive week. Use choice days here.',
    color: '#d97706',
  },
  {
    id: 'summer', title: 'Summer Trip', section: 'pto',
    start: new Date(2027, 5, 2), end: new Date(2027, 5, 18),
    basePto: 10, maxExtendBefore: 0, maxExtendAfter: 5,
    note: 'School fully out. Juneteenth Jun 18 is a free work holiday at the end. Best window for a big trip.',
    color: '#dc2626',
  },
]

const VALID_VIEWS = new Set(['windows', 'destinations', 'plan'])
const WINDOW_ID_SET = new Set(WINDOWS.map(w => w.id))
const DEST_ID_SET = new Set(DESTINATIONS.map(d => d.id))

// ─── Shareable URL state (?s=) ────────────────────────────────────────────────
const SHARE_STATE_VERSION = 1

function base64UrlEncode(str) {
  const bin = new TextEncoder().encode(str)
  let out = ''
  for (let i = 0; i < bin.length; i++) out += String.fromCharCode(bin[i])
  return btoa(out).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

function sanitizeSharePayload(raw) {
  if (!raw || typeof raw !== 'object' || raw.v !== SHARE_STATE_VERSION) return null

  const view = VALID_VIEWS.has(raw.view) ? raw.view : 'windows'

  const sel = Array.isArray(raw.sel)
    ? [...new Set(raw.sel.filter(id => WINDOW_ID_SET.has(id)))]
    : []

  const ext = {}
  if (raw.ext && typeof raw.ext === 'object') {
    for (const [id, val] of Object.entries(raw.ext)) {
      if (!WINDOW_ID_SET.has(id)) continue
      const w = WINDOWS.find(x => x.id === id)
      const before = Math.max(0, Math.min(w.maxExtendBefore, Math.round(Number(val?.before) || 0)))
      const after = Math.max(0, Math.min(w.maxExtendAfter, Math.round(Number(val?.after) || 0)))
      if (before || after) ext[id] = { before, after }
    }
  }

  const dest = raw.dest != null && DEST_ID_SET.has(String(raw.dest)) ? String(raw.dest) : null
  const drawer = raw.drawer != null && WINDOW_ID_SET.has(String(raw.drawer)) ? String(raw.drawer) : null

  return { view, sel, ext, dest, drawer }
}

function readShareStateFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    const enc = params.get('s')
    if (!enc) return null
    const json = base64UrlDecode(decodeURIComponent(enc.replace(/ /g, '+')))
    return sanitizeSharePayload(JSON.parse(json))
  } catch {
    return null
  }
}

function isDefaultSharePayload(view, sel, ext, dest, drawer) {
  return (
    view === 'windows'
    && sel.length === 0
    && Object.keys(ext).length === 0
    && dest == null
    && drawer == null
  )
}

const INITIAL_SHARE = typeof window !== 'undefined' ? readShareStateFromUrl() : null

// ─── Helpers ──────────────────────────────────────────────────────────────────
function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}
function diffDays(a, b) {
  return Math.round((b - a) / 86400000) + 1
}
function fmtShort(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── ScoreBadge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color = score >= 75 ? '#22c55e' : score >= 55 ? '#eab308' : '#ef4444'
  return (
    <span style={{
      display: 'inline-block',
      background: color + '22',
      color,
      fontSize: 13,
      fontWeight: 700,
      fontFamily: FONT,
      borderRadius: 6,
      padding: '2px 8px',
      minWidth: 36,
      textAlign: 'center',
    }}>
      {score}
    </span>
  )
}

// ─── DimensionBar ────────────────────────────────────────────────────────────
function DimensionBar({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: MUTED, width: 56, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(value / 5) * 100}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  )
}

// ─── DestinationMatches (shown inside window drawer) ─────────────────────────
function DestinationMatches({ startDate, endDate, windowColor }) {
  const ranked = rankDestinations(startDate, endDate)

  return (
    <div style={{ marginTop: 16, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
      <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
        Destination match
      </div>
      {ranked.map(r => (
        <div key={r.dest.id} style={{
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{r.dest.emoji}</span>
              <span style={{ fontSize: 15, color: TEXT, fontWeight: 600, fontFamily: FONT }}>{r.dest.name}</span>
              {r.durationFit === 'short' && (
                <span style={{ fontSize: 11, color: '#ef4444', fontStyle: 'italic' }}>{r.durationNote}</span>
              )}
              {r.durationFit === 'ideal' && (
                <span style={{ fontSize: 11, color: '#22c55e', fontStyle: 'italic' }}>{r.durationNote}</span>
              )}
            </div>
            <ScoreBadge score={r.score} />
          </div>
          <DimensionBar label="Weather" value={r.avg.weather} color="#f59e0b" />
          <DimensionBar label="Crowds" value={r.avg.crowds} color="#8b5cf6" />
          <DimensionBar label="Cost" value={r.avg.cost} color="#22c55e" />
          <DimensionBar label="Family" value={r.avg.familyFit} color="#3b82f6" />
          <div style={{ fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
            {r.highlights[0]}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── SliderRow ────────────────────────────────────────────────────────────────
function SliderRow({ label, value, max, minDate, maxDate, ptoCost, color, onChange }) {
  if (max === 0) return null
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: 13, color: TEXT }}>
          {value === 0 ? 'none' : `+${value} day${value !== 1 ? 's' : ''}`}
          {value > 0 && <span style={{ color: color, marginLeft: 6 }}>+{ptoCost} PTO</span>}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, height: 20, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 10, color: MUTED }}>{fmtShort(minDate)}</span>
        <span style={{ fontSize: 10, color: MUTED }}>{fmtShort(maxDate)}</span>
      </div>
    </div>
  )
}

// ─── DrawerPanel ──────────────────────────────────────────────────────────────
function DrawerPanel({ w, ext, onExtChange }) {
  const startMin = addDays(w.start, -w.maxExtendBefore)
  const startMax = w.start
  const endMin = w.end
  const endMax = addDays(w.end, w.maxExtendAfter)

  return (
    <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${BORDER}` }}>
      <p style={{ margin: '0 0 12px', fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{w.note}</p>
      <SliderRow
        label="Extend before"
        value={ext.before}
        max={w.maxExtendBefore}
        minDate={startMin}
        maxDate={startMax}
        ptoCost={ext.before}
        color={w.color}
        onChange={val => onExtChange({ ...ext, before: val })}
      />
      <SliderRow
        label="Extend after"
        value={ext.after}
        max={w.maxExtendAfter}
        minDate={endMin}
        maxDate={endMax}
        ptoCost={ext.after}
        color={w.color}
        onChange={val => onExtChange({ ...ext, after: val })}
      />
      <DestinationMatches
        startDate={addDays(w.start, -ext.before)}
        endDate={addDays(w.end, ext.after)}
        windowColor={w.color}
      />
    </div>
  )
}

// ─── WindowRow ────────────────────────────────────────────────────────────────
function WindowRow({ w, isSelected, isOpen, ext, onToggleSelect, onToggleDrawer, onExtChange }) {
  const start = addDays(w.start, -ext.before)
  const end = addDays(w.end, ext.after)
  const days = diffDays(start, end)
  const pto = w.basePto + ext.before + ext.after

  return (
    <div style={{
      background: SURFACE,
      border: `1px solid ${isSelected ? w.color : BORDER}`,
      borderRadius: 10,
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 56 }}>
        {/* Checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onToggleSelect() }}
          style={{
            flexShrink: 0,
            width: 44,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label={isSelected ? 'Deselect' : 'Select'}
        >
          <div style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: `2px solid ${isSelected ? w.color : MUTED}`,
            background: isSelected ? w.color : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, border-color 0.2s',
          }}>
            {isSelected && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4L4.5 7.5L11 1" stroke={BG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        {/* Row body */}
        <button
          onClick={onToggleDrawer}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            minHeight: 56,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 12px 0 4px',
            textAlign: 'left',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontFamily: FONT, color: TEXT, fontWeight: 600 }}>{w.title}</div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
              {fmtShort(start)} – {fmtShort(end)}
            </div>
          </div>
          <div style={{ textAlign: 'right', marginRight: 10, flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontFamily: FONT, color: TEXT, lineHeight: 1, fontWeight: 300 }}>{days}</div>
            <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em' }}>days</div>
            {pto > 0 && (
              <div style={{ fontSize: 12, color: w.color, marginTop: 2, fontWeight: 600 }}>{pto} PTO</div>
            )}
          </div>
          {/* Chevron */}
          <div style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s',
            color: MUTED,
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      {isOpen && (
        <DrawerPanel w={w} ext={ext} onExtChange={onExtChange} />
      )}
    </div>
  )
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 10px' }}>
      <div style={{ width: 3, height: 16, background: color, borderRadius: 2, flexShrink: 0 }} />
      <span style={{
        fontSize: 10,
        fontFamily: FONT,
        color: MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
      }}>{label}</span>
    </div>
  )
}

// ─── WindowsTab ───────────────────────────────────────────────────────────────
function WindowsTab({ selected, extensions, openDrawer, onToggleSelect, onToggleDrawer, onExtChange }) {
  const freeWindows = WINDOWS.filter(w => w.section === 'free')
  const ptoWindows = WINDOWS.filter(w => w.section === 'pto')

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <SectionLabel label="Zero PTO — completely free" color={TEAL} />
      {freeWindows.map(w => (
        <WindowRow
          key={w.id}
          w={w}
          isSelected={selected.has(w.id)}
          isOpen={openDrawer === w.id}
          ext={extensions[w.id] || { before: 0, after: 0 }}
          onToggleSelect={() => onToggleSelect(w.id)}
          onToggleDrawer={() => onToggleDrawer(w.id)}
          onExtChange={ext => onExtChange(w.id, ext)}
        />
      ))}
      <SectionLabel label="Requires PTO" color={MUTED} />
      {ptoWindows.map(w => (
        <WindowRow
          key={w.id}
          w={w}
          isSelected={selected.has(w.id)}
          isOpen={openDrawer === w.id}
          ext={extensions[w.id] || { before: 0, after: 0 }}
          onToggleSelect={() => onToggleSelect(w.id)}
          onToggleDrawer={() => onToggleDrawer(w.id)}
          onExtChange={ext => onExtChange(w.id, ext)}
        />
      ))}
    </div>
  )
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────
function PlanCard({ w, ext, onRemove }) {
  const start = addDays(w.start, -ext.before)
  const end = addDays(w.end, ext.after)
  const days = diffDays(start, end)
  const pto = w.basePto + ext.before + ext.after

  return (
    <div style={{
      background: SURFACE,
      border: `1px solid ${w.color}`,
      borderRadius: 10,
      padding: 16,
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontFamily: FONT, color: TEXT, fontWeight: 600 }}>{w.title}</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{fmtShort(start)} – {fmtShort(end)}</div>
        </div>
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            color: MUTED,
            fontSize: 12,
            padding: '6px 12px',
            cursor: 'pointer',
            minHeight: 44,
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          Remove
        </button>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <span style={{ fontSize: 26, fontFamily: FONT, color: TEXT, fontWeight: 300 }}>{days}</span>
          <span style={{ fontSize: 12, color: MUTED, marginLeft: 5 }}>days off</span>
        </div>
        {pto > 0 && (
          <div>
            <span style={{ fontSize: 26, fontFamily: FONT, color: w.color, fontWeight: 300 }}>{pto}</span>
            <span style={{ fontSize: 12, color: MUTED, marginLeft: 5 }}>PTO days</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SummaryBar ───────────────────────────────────────────────────────────────
function SummaryBar({ totalPto }) {
  const pct = Math.min(totalPto / 21, 1)
  const over = totalPto > 21

  return (
    <div style={{
      background: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      padding: 16,
      margin: '20px 0 0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: MUTED }}>Total PTO</span>
        <span style={{ fontSize: 14, color: over ? RED : TEXT }}>
          {totalPto} / 21 days
        </span>
      </div>
      <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          background: over ? RED : TEAL,
          borderRadius: 3,
          transition: 'width 0.4s, background 0.3s',
        }} />
      </div>
      <p style={{ fontSize: 12, color: MUTED, margin: '10px 0 0', lineHeight: 1.6 }}>
        PTO cap is 31.5 days. Target spend ~21 days (projected EOY balance 30.09 + 2 choice days exceeds cap).
      </p>
    </div>
  )
}

// ─── MonthHeatmap ────────────────────────────────────────────────────────────
const MONTH_LABELS = ['J','F','M','A','M','J','J','A','S','O','N','D']

function MonthHeatmap({ dest }) {
  return (
    <div style={{ display: 'flex', gap: 3, margin: '8px 0 4px' }}>
      {dest.months.map((m, i) => {
        const overall = (m.weather + m.crowds + m.cost + m.familyFit) / 4
        const pct = overall / 5
        const color = pct >= 0.75 ? '#22c55e' : pct >= 0.55 ? '#eab308' : '#ef4444'
        return (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: 20,
              borderRadius: 3,
              background: color + Math.round(pct * 200 + 55).toString(16).padStart(2, '0'),
              marginBottom: 2,
            }} />
            <span style={{ fontSize: 9, color: MUTED }}>{MONTH_LABELS[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── DestinationsTab ─────────────────────────────────────────────────────────
function DestinationsTab({ selectedDest, onSelectDest, selected, extensions }) {
  const dest = DESTINATIONS.find(d => d.id === selectedDest)
  const windowScores = dest ? bestWindows(dest.id) : []

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <div style={{ height: 16 }} />

      {/* Destination picker */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {DESTINATIONS.map(d => (
          <button
            key={d.id}
            onClick={() => onSelectDest(selectedDest === d.id ? null : d.id)}
            style={{
              background: selectedDest === d.id ? TEAL + '22' : SURFACE,
              border: `1px solid ${selectedDest === d.id ? TEAL : BORDER}`,
              borderRadius: 8,
              padding: '8px 14px',
              color: selectedDest === d.id ? TEXT : MUTED,
              fontSize: 14,
              fontFamily: FONT,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{d.emoji}</span>
            {d.name}
          </button>
        ))}
      </div>

      {!dest && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌍</div>
          <p style={{ color: MUTED, fontSize: 15, fontFamily: FONT }}>Pick a destination to see which travel windows are the best fit.</p>
        </div>
      )}

      {dest && (
        <>
          {/* Destination header */}
          <div style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{dest.emoji}</span>
              <div>
                <div style={{ fontSize: 20, color: TEXT, fontWeight: 700, fontFamily: FONT }}>{dest.name}</div>
                <div style={{ fontSize: 13, color: MUTED }}>{dest.country} · {dest.idealDays}-day ideal · {dest.minDays}-day minimum</div>
              </div>
            </div>
            <MonthHeatmap dest={dest} />
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Monthly seasonality — green = best conditions</div>
          </div>

          {/* Window ranking */}
          <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginTop: 20 }}>
            Best windows for {dest.name}
          </div>
          {windowScores.map(r => {
            const w = r.window
            const isSelected = selected.has(w.id)
            const ext = extensions[w.id] || { before: 0, after: 0 }
            const start = addDays(w.start, -ext.before)
            const end = addDays(w.end, ext.after)

            return (
              <div key={w.id} style={{
                background: SURFACE,
                border: `1px solid ${isSelected ? w.color : BORDER}`,
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 15, color: TEXT, fontWeight: 600, fontFamily: FONT }}>{w.title}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                      {fmtShort(start)} – {fmtShort(end)} · {diffDays(start, end)} days
                      {w.basePto > 0 && <span style={{ color: w.color }}> · {w.basePto + ext.before + ext.after} PTO</span>}
                    </div>
                  </div>
                  <ScoreBadge score={r.score} />
                </div>
                <DimensionBar label="Weather" value={r.avg.weather} color="#f59e0b" />
                <DimensionBar label="Crowds" value={r.avg.crowds} color="#8b5cf6" />
                <DimensionBar label="Cost" value={r.avg.cost} color="#22c55e" />
                <DimensionBar label="Family" value={r.avg.familyFit} color="#3b82f6" />
                {r.durationFit === 'short' && (
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6, fontStyle: 'italic' }}>
                    ⚠ Window is shorter than recommended {dest.minDays}-day minimum
                  </div>
                )}
                <div style={{ fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                  {r.highlights[0]}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

// ─── PlanTab ──────────────────────────────────────────────────────────────────
function PlanTab({ selected, extensions, totalPto, onRemove }) {
  const selectedWindows = WINDOWS.filter(w => selected.has(w.id))

  if (selectedWindows.length === 0) {
    return (
      <div style={{ padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✈</div>
        <p style={{ fontSize: 16, color: MUTED, fontFamily: FONT }}>Go to Windows to start planning.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <div style={{ height: 16 }} />
      {selectedWindows.map(w => (
        <PlanCard
          key={w.id}
          w={w}
          ext={extensions[w.id] || { before: 0, after: 0 }}
          onRemove={() => onRemove(w.id)}
        />
      ))}
      <SummaryBar totalPto={totalPto} />
    </div>
  )
}

// ─── GlobalHeader ─────────────────────────────────────────────────────────────
function GlobalHeader({ view, setView, totalPto, selectedCount, shareHint, onCopyShareLink }) {
  const pct = Math.min(totalPto / 21, 1)
  const over = totalPto > 21
  const barColor = totalPto === 0 ? MUTED : over ? RED : TEAL

  let statusText
  if (totalPto === 0) statusText = 'tap windows to plan'
  else if (totalPto <= 20) statusText = `${21 - totalPto} days left to spend`
  else if (totalPto === 21) statusText = 'at target \u2736'
  else statusText = `${totalPto - 21} over target`

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: BG,
      borderBottom: `1px solid ${BORDER}`,
      padding: '10px 16px 0',
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 18, fontFamily: FONT, color: TEXT, fontWeight: 700 }}>Travel Windows</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: MUTED, letterSpacing: '0.02em' }}>2026–27</span>
            <button
              type="button"
              onClick={onCopyShareLink}
              style={{
                background: 'none',
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                color: shareHint ? TEAL : MUTED,
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: 600,
                padding: '4px 10px',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {shareHint || 'Copy link'}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontFamily: FONT, color: over ? RED : TEXT, lineHeight: 1, fontWeight: 300 }}>
            {totalPto}
            <span style={{ fontSize: 16, color: MUTED, fontWeight: 400 }}> / 21</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: '0.02em' }}>PTO days</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: BORDER, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          background: barColor,
          borderRadius: 2,
          transition: 'width 0.4s, background 0.3s',
        }} />
      </div>

      {/* Status line */}
      <div style={{ fontSize: 12, color: over ? RED : MUTED, marginBottom: 8 }}>
        {statusText}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${BORDER}`, margin: '0 -16px' }}>
        {['windows', 'destinations', 'plan'].map(tab => {
          const label = tab === 'windows' ? 'Windows' : tab === 'destinations' ? 'Destinations' : 'Plan'
          return (
            <button
              key={tab}
              onClick={() => setView(tab)}
              style={{
                flex: 1,
                height: 44,
                background: 'none',
                border: 'none',
                borderBottom: view === tab ? `2px solid ${TEAL}` : '2px solid transparent',
                color: view === tab ? TEXT : MUTED,
                fontSize: 14,
                fontFamily: FONT,
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: 0,
                transition: 'color 0.2s, border-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {label}
              {tab === 'plan' && selectedCount > 0 && (
                <span style={{
                  background: TEAL,
                  color: BG,
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: FONT,
                  padding: '1px 7px',
                  fontWeight: 700,
                }}>{selectedCount}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [selected, setSelected] = useState(() => new Set(INITIAL_SHARE?.sel ?? []))
  const [extensions, setExtensions] = useState(() => ({ ...(INITIAL_SHARE?.ext ?? {}) }))
  const [openDrawer, setOpenDrawer] = useState(() => INITIAL_SHARE?.drawer ?? null)
  const [view, setView] = useState(() => INITIAL_SHARE?.view ?? 'windows')
  const [selectedDest, setSelectedDest] = useState(() => INITIAL_SHARE?.dest ?? null)
  const [shareHint, setShareHint] = useState(null)

  const getExt = id => extensions[id] || { before: 0, after: 0 }

  useEffect(() => {
    const selArr = [...selected].sort()
    const extObj = {}
    for (const [id, val] of Object.entries(extensions)) {
      if (!WINDOW_ID_SET.has(id)) continue
      const w = WINDOWS.find(x => x.id === id)
      const b = Math.max(0, Math.min(w.maxExtendBefore, Math.round(Number(val?.before) || 0)))
      const a = Math.max(0, Math.min(w.maxExtendAfter, Math.round(Number(val?.after) || 0)))
      if (b || a) extObj[id] = { before: b, after: a }
    }
    const isDefault = isDefaultSharePayload(view, selArr, extObj, selectedDest, openDrawer)
    const url = new URL(window.location.href)
    if (isDefault) url.searchParams.delete('s')
    else {
      const payload = {
        v: SHARE_STATE_VERSION,
        view,
        sel: selArr,
        ext: extObj,
        dest: selectedDest,
        drawer: openDrawer,
      }
      url.searchParams.set('s', base64UrlEncode(JSON.stringify(payload)))
    }
    const next = url.pathname + url.search + url.hash
    const cur = window.location.pathname + window.location.search + window.location.hash
    if (next !== cur) window.history.replaceState(null, '', next)
  }, [selected, extensions, view, selectedDest, openDrawer])

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareHint('Copied')
    } catch {
      setShareHint('Failed')
    }
    setTimeout(() => setShareHint(null), 2000)
  }, [])

  const totalPto = useMemo(() =>
    Array.from(selected).reduce((sum, id) => {
      const w = WINDOWS.find(w => w.id === id)
      if (!w) return sum
      const ext = getExt(id)
      return sum + w.basePto + ext.before + ext.after
    }, 0)
  , [selected, extensions])

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        if (openDrawer === id) setOpenDrawer(null)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleDrawer(id) {
    setOpenDrawer(prev => prev === id ? null : id)
    setSelected(prev => {
      if (prev.has(id)) return prev
      return new Set([...prev, id])
    })
  }

  function setExtChange(id, ext) {
    setExtensions(prev => ({ ...prev, [id]: ext }))
  }

  function removeFromPlan(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setExtensions(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    if (openDrawer === id) setOpenDrawer(null)
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: FONT, maxWidth: 640, margin: '0 auto' }}>
      <GlobalHeader
        view={view}
        setView={setView}
        totalPto={totalPto}
        selectedCount={selected.size}
        shareHint={shareHint}
        onCopyShareLink={copyShareLink}
      />
      {view === 'windows' ? (
        <WindowsTab
          selected={selected}
          extensions={extensions}
          openDrawer={openDrawer}
          onToggleSelect={toggleSelect}
          onToggleDrawer={toggleDrawer}
          onExtChange={setExtChange}
        />
      ) : view === 'destinations' ? (
        <DestinationsTab
          selectedDest={selectedDest}
          onSelectDest={setSelectedDest}
          selected={selected}
          extensions={extensions}
        />
      ) : (
        <PlanTab
          selected={selected}
          extensions={extensions}
          totalPto={totalPto}
          onRemove={removeFromPlan}
        />
      )}
    </div>
  )
}

// ─── Mount ────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
