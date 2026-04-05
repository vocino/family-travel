import { WINDOWS, DESTINATIONS } from '../data/index.js'

export const SHARE_STATE_VERSION = 1

const VALID_VIEWS = new Set(['windows', 'destinations', 'plan'])
const WINDOW_ID_SET = new Set(WINDOWS.map(w => w.id))
const DEST_ID_SET = new Set(DESTINATIONS.map(d => d.id))

export function base64UrlEncode(str) {
  const bin = new TextEncoder().encode(str)
  let out = ''
  for (let i = 0; i < bin.length; i++) out += String.fromCharCode(bin[i])
  return btoa(out).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlDecode(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function sanitizeSharePayload(raw) {
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

/** @param {string} search e.g. window.location.search or "?s=..." */
export function parseShareStateFromSearch(search) {
  const q = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(q)
  const enc = params.get('s')
  if (enc == null || enc === '') return { kind: 'absent' }

  let raw
  try {
    raw = JSON.parse(base64UrlDecode(decodeURIComponent(enc.replace(/ /g, '+'))))
  } catch {
    return { kind: 'bad', reason: 'corrupt' }
  }

  if (!raw || typeof raw !== 'object') return { kind: 'bad', reason: 'invalid' }
  if (raw.v !== SHARE_STATE_VERSION) return { kind: 'bad', reason: 'version' }

  const data = sanitizeSharePayload(raw)
  if (!data) return { kind: 'bad', reason: 'invalid' }
  return { kind: 'ok', data }
}

export function isDefaultSharePayload(view, sel, ext, dest, drawer) {
  return (
    view === 'windows'
    && sel.length === 0
    && Object.keys(ext).length === 0
    && dest == null
    && drawer == null
  )
}

export function buildSharePayload(view, selArr, extObj, selectedDest, openDrawer) {
  return {
    v: SHARE_STATE_VERSION,
    view,
    sel: selArr,
    ext: extObj,
    dest: selectedDest,
    drawer: openDrawer,
  }
}
