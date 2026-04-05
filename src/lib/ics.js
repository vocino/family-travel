import { addDays } from './dates.js'

function formatIcsDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function escapeIcsText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function dtStampUtc() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`
    + `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
}

export function buildTravelWindowsIcs(windows, selectedIds, extensions) {
  const stamp = dtStampUtc()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Travel Windows//EN',
    'CALSCALE:GREGORIAN',
  ]

  for (const w of windows) {
    if (!selectedIds.has(w.id)) continue
    const ext = extensions[w.id] || { before: 0, after: 0 }
    const start = addDays(w.start, -ext.before)
    const end = addDays(w.end, ext.after)
    const endExclusive = addDays(end, 1)
    const uid = `travel-windows-${w.id}-${formatIcsDate(start)}@local`
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(start)}`)
    lines.push(`DTEND;VALUE=DATE:${formatIcsDate(endExclusive)}`)
    lines.push(`SUMMARY:${escapeIcsText(`Off: ${w.title}`)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadIcsFile(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}
