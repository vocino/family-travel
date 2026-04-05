import React from 'react'
import { BG, BORDER, MUTED, RED, TEAL, TEXT, FONT } from '../theme.js'

const MESSAGES = {
  corrupt: 'This link’s saved plan could not be read. Showing a fresh planner.',
  version: 'This link was made with an older version of Travel Windows. Showing defaults.',
  invalid: 'This link’s data is not valid. Showing a fresh planner.',
}

export function UrlStateBanner({ reason, onDismiss, onResetUrl }) {
  if (!reason || !MESSAGES[reason]) return null
  return (
    <div
      role="alert"
      style={{
        margin: '0 16px 12px',
        padding: '10px 12px',
        background: `${RED}18`,
        border: `1px solid ${RED}55`,
        borderRadius: 8,
        fontSize: 13,
        fontFamily: FONT,
        color: TEXT,
        lineHeight: 1.5,
      }}
    >
      <p style={{ margin: 0 }}>{MESSAGES[reason]}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onResetUrl}
          style={{
            background: TEAL,
            color: BG,
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: FONT,
            cursor: 'pointer',
          }}
        >
          Use clean link
        </button>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: `1px solid ${BORDER}`,
            color: MUTED,
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 12,
            fontFamily: FONT,
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
