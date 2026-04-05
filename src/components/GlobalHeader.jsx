import React from 'react'
import { BG, BORDER, MUTED, RED, TEAL, TEXT, FONT } from '../theme.js'

const PTO_TARGET = 21

export function GlobalHeader({
  view,
  setView,
  totalPto,
  selectedCount,
  shareHint,
  onCopyShareLink,
  onNativeShare,
}) {
  const pct = Math.min(totalPto / PTO_TARGET, 1)
  const over = totalPto > PTO_TARGET
  const barColor = totalPto === 0 ? MUTED : over ? RED : TEAL

  let statusText
  if (totalPto === 0) statusText = 'tap windows to plan'
  else if (totalPto <= PTO_TARGET - 1) statusText = `${PTO_TARGET - totalPto} days left to spend`
  else if (totalPto === PTO_TARGET) statusText = 'at target \u2736'
  else statusText = `${totalPto - PTO_TARGET} over target`

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: BG,
        borderBottom: `1px solid ${BORDER}`,
        paddingTop: 'max(10px, env(safe-area-inset-top))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
        paddingBottom: 0,
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 18, fontFamily: FONT, color: TEXT, fontWeight: 700 }}>Travel Windows</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: MUTED, letterSpacing: '0.02em' }}>2026–27</span>
            {canShare && (
              <button
                type="button"
                onClick={onNativeShare}
                style={{
                  background: 'none',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  color: shareHint === 'Shared' ? TEAL : MUTED,
                  fontSize: 11,
                  fontFamily: FONT,
                  fontWeight: 600,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {shareHint === 'Shared' ? 'Shared' : 'Share'}
              </button>
            )}
            <button
              type="button"
              onClick={onCopyShareLink}
              style={{
                background: 'none',
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                color: shareHint === 'Copied' ? TEAL : MUTED,
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: 600,
                padding: '4px 10px',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {shareHint === 'Copied' ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontFamily: FONT, color: over ? RED : TEXT, lineHeight: 1, fontWeight: 300 }}>
            {totalPto}
            <span style={{ fontSize: 16, color: MUTED, fontWeight: 400 }}> / {PTO_TARGET}</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: '0.02em' }}>PTO days</div>
        </div>
      </div>

      <div style={{ height: 4, background: BORDER, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          background: barColor,
          borderRadius: 2,
          transition: 'width 0.4s, background 0.3s',
        }} />
      </div>

      <div style={{ fontSize: 12, color: over ? RED : MUTED, marginBottom: 8 }}>
        {statusText}
      </div>

      <nav aria-label="Main views" style={{ display: 'flex', gap: 0, borderTop: `1px solid ${BORDER}`, margin: '0 -16px' }}>
        {['windows', 'destinations', 'plan'].map(tab => {
          const label = tab === 'windows' ? 'Windows' : tab === 'destinations' ? 'Destinations' : 'Plan'
          const selected = view === tab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`tab-${tab}`}
              onClick={() => setView(tab)}
              style={{
                flex: 1,
                height: 44,
                background: 'none',
                border: 'none',
                borderBottom: selected ? `2px solid ${TEAL}` : '2px solid transparent',
                color: selected ? TEXT : MUTED,
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
      </nav>
    </header>
  )
}
