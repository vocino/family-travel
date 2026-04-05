import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { WINDOWS } from './data/index.js'
import {
  parseShareStateFromSearch,
  isDefaultSharePayload,
  base64UrlEncode,
  SHARE_STATE_VERSION,
} from './lib/shareState.js'
import { BG, TEXT, FONT } from './theme.js'
import { GlobalHeader } from './components/GlobalHeader.jsx'
import { UrlStateBanner } from './components/UrlStateBanner.jsx'
import { WindowsTab } from './components/WindowsTab.jsx'
import { DestinationsTab } from './components/DestinationsTab.jsx'
import { PlanTab } from './components/PlanTab.jsx'

const SHARE_PARSE = typeof window !== 'undefined'
  ? parseShareStateFromSearch(window.location.search)
  : { kind: 'absent' }

const WINDOW_ID_SET = new Set(WINDOWS.map(w => w.id))

function initialFromParse() {
  if (SHARE_PARSE.kind === 'ok') return { data: SHARE_PARSE.data, urlError: null }
  if (SHARE_PARSE.kind === 'bad') return { data: null, urlError: SHARE_PARSE.reason }
  return { data: null, urlError: null }
}

const { data: INITIAL_SHARE, urlError: INITIAL_URL_ERROR } = initialFromParse()

export function App() {
  const [selected, setSelected] = useState(() => new Set(INITIAL_SHARE?.sel ?? []))
  const [extensions, setExtensions] = useState(() => ({ ...(INITIAL_SHARE?.ext ?? {}) }))
  const [openDrawer, setOpenDrawer] = useState(() => INITIAL_SHARE?.drawer ?? null)
  const [view, setView] = useState(() => INITIAL_SHARE?.view ?? 'windows')
  const [selectedDest, setSelectedDest] = useState(() => INITIAL_SHARE?.dest ?? null)
  const [shareHint, setShareHint] = useState(null)
  const [urlStateError, setUrlStateError] = useState(INITIAL_URL_ERROR)

  const getExt = id => extensions[id] || { before: 0, after: 0 }

  useEffect(() => {
    const selArr = [...selected].sort()
    const extObj = {}
    for (const [id, val] of Object.entries(extensions)) {
      if (!WINDOW_ID_SET.has(id)) continue
      const w = WINDOWS.find(x => x.id === id)
      const b = Math.max(0, Math.min(w.maxExtendBefore, Math.round(Number(val?.before) || 0)))
      const a = Math.max(0, Math.min(w.maxExtendAfter, Math.round(Number(val?.after) || 0)))
      if (b || a) extObj[id] = { before: b, after: a }
    }
    const isDefault = isDefaultSharePayload(view, selArr, extObj, selectedDest, openDrawer)
    const url = new URL(window.location.href)
    if (isDefault) url.searchParams.delete('s')
    else {
      const payload = {
        v: SHARE_STATE_VERSION,
        view,
        sel: selArr,
        ext: extObj,
        dest: selectedDest,
        drawer: openDrawer,
      }
      url.searchParams.set('s', base64UrlEncode(JSON.stringify(payload)))
    }
    const next = url.pathname + url.search + url.hash
    const cur = window.location.pathname + window.location.search + window.location.hash
    if (next !== cur) window.history.replaceState(null, '', next)
  }, [selected, extensions, view, selectedDest, openDrawer])

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareHint('Copied')
    } catch {
      setShareHint('Failed')
    }
    setTimeout(() => setShareHint(null), 2000)
  }, [])

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: 'Travel Windows',
        text: 'Family travel plan (2026–27)',
        url: window.location.href,
      })
      setShareHint('Shared')
    } catch (e) {
      if (e?.name === 'AbortError') return
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShareHint('Copied')
      } catch {
        setShareHint('Failed')
      }
    }
    setTimeout(() => setShareHint(null), 2000)
  }, [])

  const resetUrlToClean = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('s')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    setUrlStateError(null)
  }, [])

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

  let mainTabpanelId = 'panel-windows'
  if (view === 'destinations') mainTabpanelId = 'panel-destinations'
  if (view === 'plan') mainTabpanelId = 'panel-plan'

  return (
    <div style={{
      background: BG,
      minHeight: '100vh',
      color: TEXT,
      fontFamily: FONT,
      maxWidth: 640,
      margin: '0 auto',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <GlobalHeader
        view={view}
        setView={setView}
        totalPto={totalPto}
        selectedCount={selected.size}
        shareHint={shareHint}
        onCopyShareLink={copyShareLink}
        onNativeShare={nativeShare}
      />
      <UrlStateBanner
        reason={urlStateError}
        onDismiss={() => setUrlStateError(null)}
        onResetUrl={resetUrlToClean}
      />
      <main role="tabpanel" id={mainTabpanelId} aria-labelledby={`tab-${view}`}>
        {view === 'windows' ? (
          <WindowsTab
            selected={selected}
            extensions={extensions}
            openDrawer={openDrawer}
            onToggleSelect={toggleSelect}
            onToggleDrawer={toggleDrawer}
            onExtChange={setExtChange}
          />
        ) : view === 'destinations' ? (
          <DestinationsTab
            selectedDest={selectedDest}
            onSelectDest={setSelectedDest}
            selected={selected}
            extensions={extensions}
          />
        ) : (
          <PlanTab
            selected={selected}
            extensions={extensions}
            totalPto={totalPto}
            onRemove={removeFromPlan}
          />
        )}
      </main>
    </div>
  )
}
