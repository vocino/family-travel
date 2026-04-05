import { describe, it, expect } from 'vitest'
import {
  base64UrlEncode,
  parseShareStateFromSearch,
  sanitizeSharePayload,
  SHARE_STATE_VERSION,
} from './shareState.js'

describe('parseShareStateFromSearch', () => {
  it('returns absent when s is missing', () => {
    expect(parseShareStateFromSearch('')).toEqual({ kind: 'absent' })
    expect(parseShareStateFromSearch('?')).toEqual({ kind: 'absent' })
    expect(parseShareStateFromSearch('?foo=1')).toEqual({ kind: 'absent' })
  })

  it('returns corrupt for invalid base64 payload', () => {
    const r = parseShareStateFromSearch('?s=!!!')
    expect(r.kind).toBe('bad')
    expect(r.reason).toBe('corrupt')
  })

  it('returns version when schema version mismatches', () => {
    const json = JSON.stringify({
      v: 999,
      view: 'windows',
      sel: [],
      ext: {},
      dest: null,
      drawer: null,
    })
    const enc = encodeURIComponent(base64UrlEncode(json))
    const r = parseShareStateFromSearch(`?s=${enc}`)
    expect(r.kind).toBe('bad')
    expect(r.reason).toBe('version')
  })

  it('round-trips a minimal payload through search string', () => {
    const payload = {
      v: SHARE_STATE_VERSION,
      view: 'plan',
      sel: ['labor-day', 'mlk'],
      ext: { 'labor-day': { before: 1, after: 0 } },
      dest: 'rome',
      drawer: null,
    }
    const enc = encodeURIComponent(base64UrlEncode(JSON.stringify(payload)))
    const r = parseShareStateFromSearch(`?s=${enc}`)
    expect(r.kind).toBe('ok')
    expect(r.data.view).toBe('plan')
    expect(r.data.sel).toContain('labor-day')
    expect(r.data.sel).toContain('mlk')
    expect(r.data.ext['labor-day']).toEqual({ before: 1, after: 0 })
    expect(r.data.dest).toBe('rome')
  })
})

describe('sanitizeSharePayload', () => {
  it('clamps extensions to window limits', () => {
    const raw = {
      v: SHARE_STATE_VERSION,
      view: 'windows',
      sel: ['labor-day'],
      ext: { 'labor-day': { before: 99, after: 99 } },
      dest: null,
      drawer: null,
    }
    const out = sanitizeSharePayload(raw)
    expect(out.ext['labor-day'].before).toBe(2)
    expect(out.ext['labor-day'].after).toBe(2)
  })

  it('drops unknown window ids from sel', () => {
    const raw = {
      v: SHARE_STATE_VERSION,
      view: 'windows',
      sel: ['labor-day', 'nope'],
      ext: {},
      dest: null,
      drawer: null,
    }
    const out = sanitizeSharePayload(raw)
    expect(out.sel).toEqual(['labor-day'])
  })
})
