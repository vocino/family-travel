import React, { useCallback } from 'react'
import { WINDOWS } from '../data/index.js'
import { addDays, diffDays, fmtShort } from '../lib/dates.js'
import { buildTravelWindowsIcs, downloadIcsFile } from '../lib/ics.js'
import { SURFACE, BORDER, TEXT, MUTED, TEAL, RED, FONT } from '../theme.js'

const PTO_TARGET = 21

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
          type="button"
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

function SummaryBar({ totalPto }) {
  const pct = Math.min(totalPto / PTO_TARGET, 1)
  const over = totalPto > PTO_TARGET

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
          {totalPto} / {PTO_TARGET} days
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

export function PlanTab({ selected, extensions, totalPto, onRemove }) {
  const selectedWindows = WINDOWS.filter(w => selected.has(w.id))

  const onDownloadIcs = useCallback(() => {
    const ics = buildTravelWindowsIcs(WINDOWS, selected, extensions)
    downloadIcsFile('travel-windows.ics', ics)
  }, [selected, extensions])

  if (selectedWindows.length === 0) {
    return (
      <div style={{ padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }} aria-hidden>✈</div>
        <p style={{ fontSize: 16, color: MUTED, fontFamily: FONT }}>Go to Windows to start planning.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px max(100px, env(safe-area-inset-bottom))' }}>
      <div style={{ height: 16 }} />
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={onDownloadIcs}
          style={{
            width: '100%',
            background: TEAL + '22',
            border: `1px solid ${TEAL}`,
            borderRadius: 8,
            color: TEXT,
            fontSize: 14,
            fontFamily: FONT,
            fontWeight: 600,
            padding: '12px 16px',
            cursor: 'pointer',
          }}
        >
          Add plan to calendar (.ics)
        </button>
        <p style={{ fontSize: 11, color: MUTED, margin: '8px 0 0', lineHeight: 1.5 }}>
          Downloads all selected windows as all-day events for Apple Calendar, Google Calendar, etc.
        </p>
      </div>
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
