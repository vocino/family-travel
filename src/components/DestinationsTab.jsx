import React from 'react'
import { DESTINATIONS } from '../data/index.js'
import { bestWindows } from '../lib/scoring.js'
import { addDays, diffDays, fmtShort } from '../lib/dates.js'
import { SURFACE, BORDER, TEXT, MUTED, TEAL, FONT } from '../theme.js'

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

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

function MonthHeatmap({ dest }) {
  return (
    <div style={{ display: 'flex', gap: 3, margin: '8px 0 4px' }}>
      {dest.months.map((m, i) => {
        const overall = (m.weather + m.crowds + m.cost + m.familyFit) / 4
        const pct = overall / 5
        const color = pct >= 0.75 ? '#22c55e' : pct >= 0.55 ? '#eab308' : '#ef4444'
        const alpha = Math.round(pct * 200 + 55).toString(16).padStart(2, '0')
        return (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: 20,
              borderRadius: 3,
              background: color + alpha,
              marginBottom: 2,
            }} />
            <span style={{ fontSize: 9, color: MUTED }}>{MONTH_LABELS[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

export function DestinationsTab({ selectedDest, onSelectDest, selected, extensions }) {
  const dest = DESTINATIONS.find(d => d.id === selectedDest)
  const windowScores = dest ? bestWindows(dest.id) : []

  return (
    <div style={{ padding: '0 16px max(100px, env(safe-area-inset-bottom))' }}>
      <div style={{ height: 16 }} />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }} role="group" aria-label="Choose destination">
        {DESTINATIONS.map(d => (
          <button
            key={d.id}
            type="button"
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
            <span aria-hidden>{d.emoji}</span>
            {d.name}
          </button>
        ))}
      </div>

      {!dest && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }} aria-hidden>🌍</div>
          <p style={{ color: MUTED, fontSize: 15, fontFamily: FONT }}>Pick a destination to see which travel windows are the best fit.</p>
        </div>
      )}

      {dest && (
        <>
          <div style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }} aria-hidden>{dest.emoji}</span>
              <div>
                <div style={{ fontSize: 20, color: TEXT, fontWeight: 700, fontFamily: FONT }}>{dest.name}</div>
                <div style={{ fontSize: 13, color: MUTED }}>{dest.country} · {dest.idealDays}-day ideal · {dest.minDays}-day minimum</div>
              </div>
            </div>
            <MonthHeatmap dest={dest} />
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Monthly seasonality — green = best conditions</div>
          </div>

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
