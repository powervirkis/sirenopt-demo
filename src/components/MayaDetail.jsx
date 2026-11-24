import { PROPERTY_ORDER, STATUS_META } from '../data'
import SpecBar from './SpecBar'

export default function MayaDetail({ sample, disposition, onBack, onSendToDerek, onHold }) {
  if (!sample) return null

  const meta = STATUS_META[sample.status]
  const done = disposition === 'accepted' || disposition === 'escalated' || disposition === 'held'

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-surface">
      <div className="slide-in mx-auto min-h-full max-w-3xl pb-10">
        <header className="sticky top-0 z-10 border-b border-line bg-panel/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="min-h-12 rounded-xl border-2 border-line px-4 text-sm font-semibold text-ink hover:bg-surface"
            >
              ← Back
            </button>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Maya</p>
          </div>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <div
            className={`rounded-2xl border border-line border-l-4 bg-panel p-5 shadow-sm sm:p-6 ${meta.row}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-3xl font-bold tabular-nums text-ink">#{sample.id}</h2>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-bold uppercase tracking-wide ${meta.chip}`}
              >
                {meta.word}
              </span>
            </div>
            <p className="mt-3 text-base font-medium text-ink">{sample.drive.phrase}</p>
          </div>

          {sample.status === 'pass' ? (
            <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
              <p className="text-base font-medium text-ink">All three bands are inside spec</p>
              <button
                type="button"
                onClick={onBack}
                className="mt-4 min-h-14 w-full rounded-xl border-2 border-line text-base font-semibold text-ink hover:bg-surface"
              >
                Back
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
                <div className="space-y-4">
                  {PROPERTY_ORDER.map((key) => (
                    <SpecBar
                      key={key}
                      propertyKey={key}
                      value={sample.values[key]}
                      status={sample.propertyStatus[key]}
                      band={sample.bands[key]}
                      size="lg"
                    />
                  ))}
                </div>
              </div>

              {!done && sample.status === 'look' && (
                <button
                  type="button"
                  onClick={() => onSendToDerek(sample)}
                  className="min-h-16 w-full rounded-xl bg-look text-lg font-semibold text-white hover:bg-amber-700"
                >
                  Send to Derek
                </button>
              )}
              {!done && sample.status === 'fail' && (
                <button
                  type="button"
                  onClick={() => onHold(sample.id)}
                  className="min-h-16 w-full rounded-xl bg-hold text-lg font-semibold text-white hover:bg-red-800"
                >
                  Hold
                </button>
              )}
              {done && (
                <p className="rounded-xl bg-surface px-4 py-3 text-center text-sm font-medium text-muted">
                  {disposition === 'escalated' && 'Sent to Derek'}
                  {disposition === 'held' && 'Held'}
                  {disposition === 'accepted' && 'Accepted'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
