import { useCallback, useEffect, useState } from 'react'
import DerekView from './components/DerekView'
import MayaView from './components/MayaView'
import {
  SAMPLES,
  setDecision,
  clearDecision,
  summarizeDecisions,
  recordEscalation,
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
  return `${sum.unresolved} pending · ${sum.awaiting} awaiting decision · ${sum.engineer} awaiting engineer`
}

export default function App() {
  const [role, setRole] = useState('maya')
  const [derekSampleId, setDerekSampleId] = useState(SAMPLES[0].id)
  const [decisions, setDecisions] = useState({})
  const [escalations, setEscalations] = useState({})
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

  const handleAccept = (id) => {
    setDecisions((prev) => {
      const next = setDecision(prev, id, DECISION.accepted)
      if (next === prev) return prev
      announce(`Sample #${id} accepted. ${formatProgress(summarizeDecisions(SAMPLES, next))}`)
      return next
    })
  }

  const handleRework = (id) => {
    setDecisions((prev) => {
      const next = setDecision(prev, id, DECISION.rework)
      if (next === prev) return prev
      announce(
        `Sample #${id} sent for rework. ${formatProgress(summarizeDecisions(SAMPLES, next))}`,
      )
      return next
    })
  }

  const handleEngineer = (id) => {
    const sample = SAMPLES.find((s) => s.id === id)
    if (!sample) return

    setEscalations((prev) => recordEscalation(prev, sample))

    setDecisions((prev) => {
      const next = setDecision(prev, id, DECISION.engineer)
      if (next === prev) return prev
      announce(
        `Sample #${id} sent to engineer. ${formatProgress(summarizeDecisions(SAMPLES, next))}`,
      )
      return next
    })

    setDerekSampleId(id)
  }

  const handleRevert = (id) => {
    setDecisions((prev) => {
      const next = clearDecision(prev, id)
      if (next === prev) return prev
      announce(
        `Sample #${id} decision reverted. ${formatProgress(summarizeDecisions(SAMPLES, next))}`,
      )
      return next
    })
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
            {role === 'maya' ? 'Batch decisions' : 'Engineering evidence'}
          </p>
        </div>
      </nav>

      {role === 'maya' ? (
        <MayaView
          samples={SAMPLES}
          decisions={decisions}
          onAccept={handleAccept}
          onRework={handleRework}
          onEngineer={handleEngineer}
          onRevert={handleRevert}
          statusMessage={statusMessage}
          largeText={display.largeText}
          highContrast={display.highContrast}
          onToggleLargeText={() => setDisplay((d) => ({ ...d, largeText: !d.largeText }))}
          onToggleHighContrast={() =>
            setDisplay((d) => ({ ...d, highContrast: !d.highContrast }))
          }
        />
      ) : (
        <DerekView
          samples={SAMPLES}
          selectedId={derekSampleId}
          onSelect={setDerekSampleId}
          decisions={decisions}
          escalations={escalations}
          largeText={display.largeText}
          highContrast={display.highContrast}
          onToggleLargeText={() => setDisplay((d) => ({ ...d, largeText: !d.largeText }))}
          onToggleHighContrast={() =>
            setDisplay((d) => ({ ...d, highContrast: !d.highContrast }))
          }
        />
      )}
    </div>
  )
}
