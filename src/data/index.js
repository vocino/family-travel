import destinationsJson from './destinations.json'
import windowsJson from './windows.json'

export const DESTINATIONS = destinationsJson

function parseLocalDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const WINDOWS = windowsJson.map(w => ({
  ...w,
  start: parseLocalDate(w.start),
  end: parseLocalDate(w.end),
}))
