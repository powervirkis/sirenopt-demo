import { useRef } from 'react'
import {
  DISPOSITION,
  DISPOSITION_META,
  PROPERTY_ORDER,
  RESULT_META,
  canAccept,
  getDisposition,
} from '../data'
import { useDialog } from '../hooks/useDialog'
import SpecBar, { ChartLegend } from './SpecBar'
import { DispositionChip, ResultChip } from './StatusChip'

export default function MayaDetail({
  sample,
  dispositions,
  onClose,
  onAcceptOne,
  onHold,
  onRequestReview,
  onViewEngineer,
}) {
  if (!sample) return null

  const closeRef = useRef(null)
  const containerRef = useDialog({ open: true, onClose, initialFocusRef: closeRef })
  const result = sample.result || (sample.status === 'look' ? 'review' : sample.status)
  const meta = RESULT_META[result]
  const disposition = getDisposition(dispositions, sample.id)
  const dispositionMeta = DISPOSITION_META[disposition]
  const eligible = canAccept(sample, dispositions)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 overflow-y-auto bg-surface"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`maya-detail-title-${sample.id}`}
    >
      <div className="slide-in mx-auto min-h-full max-w-3xl pb-10">
        <header className="sticky top-0 z-10 border-b border-line bg-panel/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="min-h-11 min-w-11 rounded-xl border-2 border-line px-4 text-base font-semibold text-ink hover:bg-surface"
              aria-label={`Close sample #${sample.id}`}
            >
              ← Back
            </button>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">Maya</p>
          </div>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <div className={`rounded-2xl border border-line border-l-4 bg-panel p-5 shadow-sm ${meta.row}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2
                id={`maya-detail-title-${sample.id}`}
                className="text-3xl font-bold tabular-nums text-ink"
              >
                #{sample.id}
              </h2>
              <div className="flex flex-wrap gap-2">
                <ResultChip result={result} />
                <DispositionChip disposition={disposition} />
              </div>
            </div>
            <p className="mt-3 text-base font-medium text-ink">{sample.drive.phrase}</p>
            <p className="mt-2 text-sm text-muted">
              Overall result: <strong className="text-ink">{meta.word}</strong>
              {' · '}
              Disposition: <strong className="text-ink">{dispositionMeta.label}</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
            <h3 className="mb-2 text-base font-semibold text-ink">All three properties</h3>
            <ChartLegend />
            <div className="mt-4 space-y-5">
              {PROPERTY_ORDER.map((key) => (
                <SpecBar
                  key={key}
                  propertyKey={key}
                  value={sample.values[key]}
                  status={sample.propertyStatus[key]}
                  band={sample.bands[key]}
                  explanation={sample.explanations[key]}
                  size="lg"
                />
              ))}
            </div>
            {sample.secondary?.length > 0 && (
              <div className="mt-4 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
                <p className="font-semibold text-ink">Also note</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {sample.secondary.map((s) => (
                    <li key={s.reason}>{s.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {eligible && (
              <button
                type="button"
                onClick={() => onAcceptOne(sample.id)}
                className="min-h-14 w-full rounded-xl bg-pass text-lg font-semibold text-white hover:bg-green-800"
              >
                Accept #{sample.id}
              </button>
            )}
            {disposition === DISPOSITION.accepted && (
              <p className="rounded-xl bg-pass-bg px-4 py-3 text-center text-base font-semibold text-pass">
                Accepted
              </p>
            )}
            {result === 'review' && disposition !== DISPOSITION.review_requested && (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onViewEngineer(sample.id)}
                  className="min-h-14 rounded-xl border-2 border-ink bg-panel px-4 text-base font-semibold text-ink hover:bg-surface"
                >
                  View engineer detail
                </button>
                <button
                  type="button"
                  onClick={() => onRequestReview(sample.id)}
                  className="min-h-14 rounded-xl bg-look px-4 text-base font-semibold text-white hover:bg-amber-700"
                >
                  Request review (simulated)
                </button>
              </div>
            )}
            {result === 'fail' && disposition !== DISPOSITION.held && (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onHold(sample.id)}
                  className="min-h-14 rounded-xl bg-hold px-4 text-base font-semibold text-white hover:bg-red-800"
                >
                  Hold #{sample.id}
                </button>
                <button
                  type="button"
                  onClick={() => onViewEngineer(sample.id)}
                  className="min-h-14 rounded-xl border-2 border-ink bg-panel px-4 text-base font-semibold text-ink hover:bg-surface"
                >
                  View engineer detail
                </button>
              </div>
            )}
            {(disposition === DISPOSITION.held ||
              disposition === DISPOSITION.review_requested) && (
              <p className="rounded-xl bg-surface px-4 py-3 text-center text-base font-medium text-muted">
                {dispositionMeta.label}
                {result === 'review' || result === 'fail' ? (
                  <>
                    {' · '}
                    <button
                      type="button"
                      onClick={() => onViewEngineer(sample.id)}
                      className="font-semibold text-ink underline"
                    >
                      View engineer detail
                    </button>
                  </>
                ) : null}
              </p>
            )}
            {result === 'pass' && disposition === DISPOSITION.awaiting && !eligible ? null : null}
          </div>
        </div>
      </div>
    </div>
  )
}
