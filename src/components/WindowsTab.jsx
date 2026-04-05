import React from 'react'
import { WINDOWS } from '../data/index.js'
import { rankDestinations } from '../lib/scoring.js'
import { addDays, diffDays, fmtShort } from '../lib/dates.js'
import { BG, SURFACE, BORDER, TEXT, MUTED, TEAL, FONT } from '../theme.js'

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

function DestinationMatches({ startDate, endDate }) {
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

function DrawerPanel({ w, ext, onExtChange }) {
  const startMin = addDays(w.start, -w.maxExtendBefore)
  const startMax = w.start
  const endMin = w.end
  const endMax = addDays(w.end, w.maxExtendAfter)

  return (
    <div id={`drawer-${w.id}`} role="region" aria-label={`Details for ${w.title}`} style={{ padding: '12px 16px 16px', borderTop: `1px solid ${BORDER}` }}>
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
      />
    </div>
  )
}

function WindowRow({ w, isSelected, isOpen, ext, onToggleSelect, onToggleDrawer, onExtChange }) {
  const start = addDays(w.start, -ext.before)
  const end = addDays(w.end, ext.after)
  const days = diffDays(start, end)
  const pto = w.basePto + ext.before + ext.after
  const rowId = `window-row-${w.id}`

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
        <button
          type="button"
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
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden>
                <path d="M1 4L4.5 7.5L11 1" stroke={BG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        <button
          type="button"
          id={rowId}
          aria-expanded={isOpen}
          aria-controls={`drawer-${w.id}`}
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
          <div style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s',
            color: MUTED,
            flexShrink: 0,
          }} aria-hidden>
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

export function WindowsTab({ selected, extensions, openDrawer, onToggleSelect, onToggleDrawer, onExtChange }) {
  const freeWindows = WINDOWS.filter(w => w.section === 'free')
  const ptoWindows = WINDOWS.filter(w => w.section === 'pto')

  return (
    <div style={{ padding: '0 16px max(100px, env(safe-area-inset-bottom))' }}>
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
