import { useCallback, useEffect, useState } from 'react'
import BatchScreen from './components/BatchScreen'
import EscalateSheet from './components/EscalateSheet'
import MayaDetail from './components/MayaDetail'
import ReviewerNotes from './components/ReviewerNotes'
import { SAMPLES } from './data'

export default function App() {
  const [mode, setMode] = useState('20min')
  const [selectedId, setSelectedId] = useState(null)
  const [dispositions, setDispositions] = useState({})
  const [escalateSample, setEscalateSample] = useState(null)
  const [reviewerOpen, setReviewerOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [lastPackage, setLastPackage] = useState(null)

  const showToast = useCallback((message) => {
    setToast(message)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const selected = SAMPLES.find((s) => s.id === selectedId) || null

  const handleAcceptPassing = () => {
    setDispositions((prev) => {
      const next = { ...prev }
      SAMPLES.forEach((s) => {
        if (s.status === 'pass' && !next[s.id]) next[s.id] = 'accepted'
      })
      return next
    })
    showToast('Passing samples accepted')
  }

  const handleHold = (id) => {
    setDispositions((d) => ({ ...d, [id]: 'held' }))
    setSelectedId((cur) => (cur === id ? null : cur))
    showToast(`Sample ${id} held`)
  }

  const openSendToDerek = (sample) => {
    setEscalateSample(sample)
  }

  const sendToDerek = (pkg) => {
    if (!escalateSample) return
    setLastPackage(pkg)
    setDispositions((d) => ({ ...d, [escalateSample.id]: 'escalated' }))
    setSelectedId((cur) => (cur === escalateSample.id ? null : cur))
    showToast(`Sample ${escalateSample.id} sent to Derek`)
    setEscalateSample(null)
  }

  return (
    <div className="min-h-full bg-surface">
      <BatchScreen
        mode={mode}
        samples={SAMPLES}
        dispositions={dispositions}
        onModeChange={setMode}
        onOpenSample={setSelectedId}
        onAcceptPassing={handleAcceptPassing}
        onSendToDerek={openSendToDerek}
        onHold={handleHold}
        onShowReviewerNotes={() => setReviewerOpen(true)}
      />

      {selected && (
        <MayaDetail
          sample={selected}
          disposition={dispositions[selected.id]}
          onBack={() => setSelectedId(null)}
          onSendToDerek={openSendToDerek}
          onHold={handleHold}
        />
      )}

      <EscalateSheet
        sample={escalateSample}
        onCancel={() => setEscalateSample(null)}
        onSend={sendToDerek}
      />

      <ReviewerNotes open={reviewerOpen} onClose={() => setReviewerOpen(false)} />

      {toast && (
        <div
          className="toast-in fixed bottom-5 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}

      {/* Debug: last package for Derek stays in memory; not shown as engineer charts */}
      {lastPackage && <span className="sr-only">{JSON.stringify(lastPackage)}</span>}
    </div>
  )
}
