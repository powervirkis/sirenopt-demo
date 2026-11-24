import { useCallback, useEffect, useState } from 'react'
import AccessibilityMenu from './components/AccessibilityMenu'
import DerekView from './components/DerekView'
import MayaView from './components/MayaView'
import {
  ACTOR,
  SAMPLES,
  summarizeCases,
  mayaDecide,
  mayaAcceptSuggested,
  confirmEscalation,
  derekResolve,
  requestVerification,
  recordVerificationEvidence,
  reopenCase,
  DECISION,
} from './data'

const DISPLAY_KEY = 'plasmasmart-display'

function loadDisplay() {
  try {
    const raw = localStorage.getItem(DISPLAY_KEY)
    if (!raw) return { largeText: false, highContrast: false }
    return JSON.parse(raw)
  } catch {
    return { largeText: false, highContrast: false }
  }
}

function formatProgress(sum) {
  if (sum.complete) {
    return `Batch review complete · ${sum.accepted} accepted · ${sum.rework} sent for rework`
  }
  const parts = [`${sum.unresolved} to decide`]
  if (sum.awaiting) parts.push(`${sum.awaiting} awaiting decision`)
  if (sum.engineer) parts.push(`${sum.engineer} awaiting engineer`)
  if (sum.verification) parts.push(`${sum.verification} awaiting verification`)
  if (sum.accepted) parts.push(`${sum.accepted} accepted`)
  if (sum.rework) parts.push(`${sum.rework} rework`)
  return parts.join(' · ')
}

export default function App() {
  const [role, setRole] = useState('maya')
  const [mayaMode, setMayaMode] = useState('20min')
  const [derekSampleId, setDerekSampleId] = useState(null)
  const [derekTab, setDerekTab] = useState('escalations')
  const [cases, setCases] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [display, setDisplay] = useState(loadDisplay)

  useEffect(() => {
    localStorage.setItem(DISPLAY_KEY, JSON.stringify(display))
    document.documentElement.classList.toggle('large-text', display.largeText)
    document.documentElement.classList.toggle('high-contrast', display.highContrast)
  }, [display])

  const announce = useCallback((message) => {
    setStatusMessage(message)
  }, [])

  const handleMayaDecide = (id, disposition, { reason } = {}) => {
    setCases((prev) => {
      const next = mayaDecide(prev, id, disposition, { reason })
      if (next === prev) return prev
      const verb = disposition === DECISION.accepted ? 'accepted' : 'sent for rework'
      const override = next[id]?.disposition?.override ? ' (override)' : ''
      announce(`Sample #${id} ${verb}${override}. ${formatProgress(summarizeCases(SAMPLES, next))}`)
      return next
    })
  }
  const handleMayaAccept = (id, options) => handleMayaDecide(id, DECISION.accepted, options)
  const handleMayaRework = (id, options) => handleMayaDecide(id, DECISION.rework, options)

  const handleMayaAcceptSuggested = () => {
    setCases((prev) => {
      const { cases: next, ids } = mayaAcceptSuggested(prev, SAMPLES)
      if (ids.length === 0) return prev
      const label = ids.length === 1 ? '1 sample accepted' : `${ids.length} samples accepted`
      announce(`${label}. ${formatProgress(summarizeCases(SAMPLES, next))}`)
      return next
    })
  }

  const handleEscalate = (id, { reasonId, note }) => {
    const sample = SAMPLES.find((s) => s.id === id)
    if (!sample) return
    setCases((prev) => {
      const next = confirmEscalation(prev, sample, { reasonId, note })
      if (next === prev) return prev
      announce(
        `Sample #${id} sent to engineer. ${formatProgress(summarizeCases(SAMPLES, next))}`,
      )
      return next
    })
    setDerekSampleId(id)
  }

  const handleMayaReopen = (id) => {
    setCases((prev) => {
      const next = reopenCase(prev, id, ACTOR.maya)
      if (next === prev) return prev
      announce(`Sample #${id} reopened. ${formatProgress(summarizeCases(SAMPLES, next))}`)
      return next
    })
  }

  const handleDerekResolve = (id, disposition, reason) => {
    setCases((prev) => {
      const next = derekResolve(prev, id, disposition, { reason })
      if (next === prev) return prev
      const label = disposition === DECISION.accepted ? 'accepted' : 'sent for rework'
      announce(`Sample #${id} ${label} by Derek. ${formatProgress(summarizeCases(SAMPLES, next))}`)
      return next
    })
  }

  const handleRequestVerification = (id, payload) => {
    setCases((prev) => {
      const next = requestVerification(prev, id, payload)
      if (next === prev) return prev
      announce(
        `Verification requested for sample #${id}. ${formatProgress(summarizeCases(SAMPLES, next))}`,
      )
      return next
    })
  }

  const handleRecordEvidence = (id, payload) => {
    setCases((prev) => {
      const next = recordVerificationEvidence(prev, id, payload)
      if (next === prev) return prev
      announce(
        `Verification evidence recorded for sample #${id}. Awaiting engineer decision.`,
      )
      return next
    })
  }

  const handleDerekReopen = (id) => {
    setCases((prev) => {
      const next = reopenCase(prev, id, ACTOR.derek)
      if (next === prev) return prev
      announce(`Sample #${id} reopened. ${formatProgress(summarizeCases(SAMPLES, next))}`)
      return next
    })
    setDerekSampleId(id)
    setDerekTab('escalations')
  }

  return (
    <div className="min-h-full bg-surface">
      <nav
        className="sticky top-0 z-20 border-b border-line bg-panel/95 backdrop-blur"
        aria-label="Role"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
          <div
            className="flex rounded-xl border-2 border-line bg-surface p-1"
            role="radiogroup"
            aria-label="Role view"
          >
            <button
              type="button"
              role="radio"
              aria-checked={role === 'maya'}
              onClick={() => setRole('maya')}
              className={`min-h-12 rounded-lg px-4 text-base font-semibold ${
                role === 'maya' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
              }`}
            >
              Maya
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={role === 'derek'}
              onClick={() => setRole('derek')}
              className={`min-h-12 rounded-lg px-4 text-base font-semibold ${
                role === 'derek' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
              }`}
            >
              Derek
            </button>
          </div>
          <p className="hidden text-sm text-muted sm:block">
            {role === 'maya' ? 'Batch decisions' : 'Engineering escalations'}
          </p>
          <div className="ml-auto">
            <AccessibilityMenu
              largeText={display.largeText}
              highContrast={display.highContrast}
              onToggleLargeText={() => setDisplay((d) => ({ ...d, largeText: !d.largeText }))}
              onToggleHighContrast={() =>
                setDisplay((d) => ({ ...d, highContrast: !d.highContrast }))
              }
            />
          </div>
        </div>
      </nav>

      {role === 'maya' ? (
        <MayaView
          samples={SAMPLES}
          cases={cases}
          mode={mayaMode}
          onModeChange={setMayaMode}
          onAccept={handleMayaAccept}
          onRework={handleMayaRework}
          onAcceptSuggested={handleMayaAcceptSuggested}
          onEscalate={handleEscalate}
          onReopen={handleMayaReopen}
          statusMessage={statusMessage}
        />
      ) : (
        <DerekView
          samples={SAMPLES}
          cases={cases}
          selectedId={derekSampleId}
          onSelect={setDerekSampleId}
          tab={derekTab}
          onTabChange={setDerekTab}
          onResolve={handleDerekResolve}
          onRequestVerification={handleRequestVerification}
          onRecordEvidence={handleRecordEvidence}
          onReopen={handleDerekReopen}
          statusMessage={statusMessage}
        />
      )}
    </div>
  )
}
