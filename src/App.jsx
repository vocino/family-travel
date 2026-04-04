import React, { useState, useMemo } from 'react'
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const WINDOWS = [
  {
    id: 'labor-day', title: 'Labor Day Weekend', section: 'free',
    start: new Date(2026, 8, 5), end: new Date(2026, 8, 7),
    basePto: 0, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'Meta holiday Sep 7 + school off. Free long weekend.',
    color: '#0d9488',
  },
  {
    id: 'mlk', title: 'MLK + Meta Day', section: 'free',
    start: new Date(2027, 0, 16), end: new Date(2027, 0, 19),
    basePto: 0, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'School off Jan 18, Meta holiday Jan 19. Free 4-day weekend.',
    color: '#0d9488',
  },
  {
    id: 'presidents', title: "Presidents' Day Stretch", section: 'free',
    start: new Date(2027, 1, 12), end: new Date(2027, 1, 16),
    basePto: 0, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'FUSD non-work day Feb 12, Presidents\u2019 Day Feb 15, Meta holiday Feb 16. Best free stretch.',
    color: '#0d9488',
  },
  {
    id: 'memorial', title: 'Memorial Day + Last Day', section: 'free',
    start: new Date(2027, 4, 29), end: new Date(2027, 4, 31),
    basePto: 0, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'Meta holiday May 31 + school ends Jun 1. Summer kickoff.',
    color: '#0d9488',
  },
  {
    id: 'fall-recess', title: 'Fall Recess', section: 'pto',
    start: new Date(2026, 10, 21), end: new Date(2026, 10, 29),
    basePto: 2, maxExtendBefore: 3, maxExtendAfter: 3,
    note: 'School off Nov 23\u201327. Meta covers Thanksgiving + day after. 2 PTO days = 10-day stretch.',
    color: '#2563eb',
  },
  {
    id: 'winter-min', title: 'Winter Break (minimal)', section: 'pto',
    start: new Date(2026, 11, 19), end: new Date(2027, 0, 4),
    basePto: 1, maxExtendBefore: 0, maxExtendAfter: 3,
    note: '1 PTO day (Dec 19 head start). School off Dec 21\u2013Jan 4. Meta covers Dec 24, 25 & 31.',
    color: '#2563eb',
  },
  {
    id: 'winter-full', title: 'Winter Break (full dark)', section: 'pto',
    start: new Date(2026, 11, 19), end: new Date(2027, 0, 4),
    basePto: 6, maxExtendBefore: 0, maxExtendAfter: 3,
    note: '6 PTO days \u2014 fully offline both work weeks. Meta covers Dec 24, 25 & 31.',
    color: '#7c3aed',
  },
  {
    id: 'spring', title: 'Spring Break', section: 'pto',
    start: new Date(2027, 2, 13), end: new Date(2027, 2, 21),
    basePto: 5, maxExtendBefore: 2, maxExtendAfter: 2,
    note: 'School off Mar 15\u201319. No Meta holidays \u2014 most PTO-expensive week. Use choice days here.',
    color: '#d97706',
  },
  {
    id: 'summer', title: 'Summer Trip', section: 'pto',
    start: new Date(2027, 5, 2), end: new Date(2027, 5, 18),
    basePto: 10, maxExtendBefore: 0, maxExtendAfter: 5,
    note: 'School fully out. Juneteenth Jun 18 is a free Meta holiday at the end. Best window for a big trip.',
    color: '#dc2626',
  },
]

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
function GlobalHeader({ view, setView, totalPto, selectedCount }) {
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
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2, letterSpacing: '0.02em' }}>FUSD · Meta · 2026–27</div>
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
        {['windows', 'plan'].map(tab => (
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
              fontSize: 15,
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
            {tab === 'windows' ? 'Windows' : 'Plan'}
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
        ))}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [selected, setSelected] = useState(new Set())
  const [extensions, setExtensions] = useState({})
  const [openDrawer, setOpenDrawer] = useState(null)
  const [view, setView] = useState('windows')

  const getExt = id => extensions[id] || { before: 0, after: 0 }

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
