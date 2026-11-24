import { useCallback, useEffect, useState } from 'react'
import BatchScreen from './components/BatchScreen'
import MayaDetail from './components/MayaDetail'
import ReviewerNotes from './components/ReviewerNotes'
import SampleDetail from './components/SampleDetail'
import {
  SAMPLES,
  acceptEligible,
  acceptOne,
  holdOne,
  requestReview,
  summarize,
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

export default function App() {
  const [mode, setMode] = useState('20min')
  const [mayaId, setMayaId] = useState(null)
  const [engineerId, setEngineerId] = useState(null)
  const [dispositions, setDispositions] = useState({})
  const [reviewerOpen, setReviewerOpen] = useState(false)
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

  const mayaSample = SAMPLES.find((s) => s.id === mayaId) || null
  const engineerSample = SAMPLES.find((s) => s.id === engineerId) || null
  const overlayOpen = Boolean(mayaSample || engineerSample || reviewerOpen)

  const handleAcceptOne = (id) => {
    setDispositions((prev) => {
      const next = acceptOne(SAMPLES, prev, id)
      const sum = summarize(SAMPLES, next)
      announce(
        `Sample #${id} accepted; ${sum.ready} sample${sum.ready === 1 ? '' : 's'} remain${sum.ready === 1 ? 's' : ''} ready.`,
      )
      return next
    })
  }

  const handleAcceptEligible = () => {
    setDispositions((prev) => {
      const next = acceptEligible(SAMPLES, prev)
      const sum = summarize(SAMPLES, next)
      announce(
        `Eligible passing samples accepted; ${sum.accepted} accepted, ${sum.ready} ready.`,
      )
      return next
    })
  }

  const handleHold = (id) => {
    setDispositions((prev) => {
      const next = holdOne(SAMPLES, prev, id)
      announce(`Sample #${id} held. Result remains FAIL.`)
      return next
    })
  }

  const handleRequestReview = (id) => {
    setDispositions((prev) => {
      const next = requestReview(SAMPLES, prev, id)
      announce(`Sample #${id}: review requested (simulated). No message was sent.`)
      return next
    })
  }

  const handleReset = () => {
    setDispositions({})
    setMayaId(null)
    setEngineerId(null)
    announce('Demo reset. Session actions cleared.')
  }

  return (
    <div className="min-h-full bg-surface">
      <div {...(overlayOpen ? { inert: '' } : {})}>
        <BatchScreen
          mode={mode}
          samples={SAMPLES}
          dispositions={dispositions}
          onModeChange={setMode}
          onOpenSample={setMayaId}
          onAcceptOne={handleAcceptOne}
          onAcceptEligible={handleAcceptEligible}
          onHold={handleHold}
          onRequestReview={handleRequestReview}
          onViewEngineer={setEngineerId}
          onShowReviewerNotes={() => setReviewerOpen(true)}
          onResetDemo={handleReset}
          largeText={display.largeText}
          highContrast={display.highContrast}
          onToggleLargeText={() =>
            setDisplay((d) => ({ ...d, largeText: !d.largeText }))
          }
          onToggleHighContrast={() =>
            setDisplay((d) => ({ ...d, highContrast: !d.highContrast }))
          }
          statusMessage={statusMessage}
        />
      </div>

      {mayaSample && (
        <MayaDetail
          sample={mayaSample}
          dispositions={dispositions}
          onClose={() => setMayaId(null)}
          onAcceptOne={handleAcceptOne}
          onHold={handleHold}
          onRequestReview={handleRequestReview}
          onViewEngineer={(id) => {
            setMayaId(null)
            setEngineerId(id)
          }}
        />
      )}

      {engineerSample && (
        <SampleDetail
          sample={engineerSample}
          dispositions={dispositions}
          onBack={() => setEngineerId(null)}
          onRequestReview={handleRequestReview}
        />
      )}

      <ReviewerNotes open={reviewerOpen} onClose={() => setReviewerOpen(false)} />
    </div>
  )
}
