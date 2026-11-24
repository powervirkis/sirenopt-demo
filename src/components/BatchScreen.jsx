import { BATCH, PROPERTIES, PROPERTY_ORDER, STATUS_META, batchCounts } from '../data'
import SpecBar from './SpecBar'

function dispositionLabel(disposition, sample) {
  if (disposition === 'accepted') return 'Accepted'
  if (disposition === 'escalated') return 'Sent'
  if (disposition === 'held') return 'Held'
  return STATUS_META[sample.status].word
}

function RowAction({ sample, disposition, onSendToDerek, onHold }) {
  if (disposition === 'accepted') {
    return (
      <span className="inline-flex min-h-14 items-center justify-center rounded-xl bg-pass-bg px-4 text-sm font-semibold text-pass">
        Accepted
      </span>
    )
  }
  if (disposition === 'escalated') {
    return (
      <span className="inline-flex min-h-14 items-center justify-center rounded-xl bg-look-bg px-4 text-sm font-semibold text-look">
        Sent to Derek
      </span>
    )
  }
  if (disposition === 'held') {
    return (
      <span className="inline-flex min-h-14 items-center justify-center rounded-xl bg-hold-bg px-4 text-sm font-semibold text-hold">
        Held
      </span>
    )
  }

  if (sample.status === 'fail') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onHold(sample.id)
        }}
        className="min-h-14 min-w-[8rem] rounded-xl bg-hold px-4 text-base font-semibold text-white hover:bg-red-800"
      >
        Hold
      </button>
    )
  }

  if (sample.status === 'look') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSendToDerek(sample)
        }}
        className="min-h-14 min-w-[9rem] rounded-xl bg-look px-4 text-base font-semibold text-white hover:bg-amber-700"
      >
        Send to Derek
      </button>
    )
  }

  return null
}

export default function BatchScreen({
  mode,
  samples,
  dispositions,
  onModeChange,
  onOpenSample,
  onAcceptPassing,
  onSendToDerek,
  onHold,
  onShowReviewerNotes,
}) {
  const counts = batchCounts(samples)
  const passing = samples.filter((s) => s.status === 'pass')
  const passingPending = passing.filter((s) => !dispositions[s.id])
  const passingAccepted = passing.every((s) => dispositions[s.id] === 'accepted')

  const problems = samples
    .filter((s) => s.status === 'fail' || s.status === 'look')
    .sort((a, b) => {
      const rank = { fail: 0, look: 1 }
      return rank[a.status] - rank[b.status] || a.id - b.id
    })

  const listSamples = mode === '2min' ? problems : samples

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-4 p-4 pb-8 sm:p-6">
      <header className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              SirenOpt PlasmaSmart™ · Maya
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Batch results</h1>
            <p className="mt-1 text-sm text-muted">
              {BATCH.line} · {BATCH.product} · Batch {BATCH.id} · {BATCH.shift}
            </p>
          </div>
          <div className="flex rounded-xl border-2 border-line bg-surface p-1">
            <button
              type="button"
              onClick={() => onModeChange('20min')}
              className={`min-h-12 rounded-lg px-4 text-sm font-semibold ${
                mode === '20min' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
              }`}
            >
              20 min
            </button>
            <button
              type="button"
              onClick={() => onModeChange('2min')}
              className={`min-h-12 rounded-lg px-4 text-sm font-semibold ${
                mode === '2min' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
              }`}
            >
              2 min
            </button>
          </div>
        </div>

        <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-muted sm:text-sm">
          Spec · Mass loading {PROPERTIES.massLoading.min}–{PROPERTIES.massLoading.max}{' '}
          {PROPERTIES.massLoading.unit} · Porosity {PROPERTIES.porosity.min}–
          {PROPERTIES.porosity.max}
          {PROPERTIES.porosity.unit} · Sheet resistance {PROPERTIES.sheetResistance.min}–
          {PROPERTIES.sheetResistance.max} {PROPERTIES.sheetResistance.unit}
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3 shadow-sm">
        <p className="text-sm font-medium text-ink sm:text-base">
          <span className="text-pass">{counts.ready} ready to accept</span>
          <span className="mx-2 text-line">·</span>
          <span className="text-look">{counts.look} need a second look</span>
          <span className="mx-2 text-line">·</span>
          <span className="text-hold">{counts.hold} hold</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {mode === '2min' && (
            <>
              <button
                type="button"
                onClick={() => onModeChange('20min')}
                className="min-h-12 rounded-xl border-2 border-line px-4 text-sm font-semibold text-ink hover:bg-surface"
              >
                Full batch
              </button>
              <button
                type="button"
                onClick={onShowReviewerNotes}
                className="min-h-12 rounded-xl border border-dashed border-muted/40 px-3 text-xs font-medium text-muted hover:bg-surface"
              >
                What this view hides
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2-min: collapsed passes */}
      {mode === '2min' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pass/30 border-l-4 border-l-pass bg-pass-bg/40 px-4 py-3">
          <p className="text-base font-semibold text-pass">
            2 passing · #{passing.map((s) => s.id).join(' #')}
          </p>
          {passingAccepted ? (
            <span className="inline-flex min-h-12 items-center rounded-xl bg-pass-bg px-4 text-sm font-semibold text-pass">
              Accepted
            </span>
          ) : (
            <button
              type="button"
              onClick={onAcceptPassing}
              disabled={passingPending.length === 0}
              className="min-h-12 rounded-xl bg-pass px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
            >
              Accept
            </button>
          )}
        </div>
      )}

      <ul className="space-y-3">
        {listSamples.map((sample) => {
          const disposition = dispositions[sample.id]
          const shownStatus =
            disposition === 'accepted'
              ? 'pass'
              : disposition === 'held'
                ? 'fail'
                : disposition === 'escalated'
                  ? 'look'
                  : sample.status
          const shownMeta = STATUS_META[shownStatus]

          if (mode === '2min') {
            const statusWord = sample.status === 'fail' ? 'HOLD' : 'SECOND LOOK'
            return (
              <li key={sample.id}>
                <div
                  className={`flex w-full flex-col gap-3 rounded-2xl border border-line border-l-4 bg-panel p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${shownMeta.row}`}
                >
                  <button
                    type="button"
                    onClick={() => onOpenSample(sample.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-base font-semibold text-ink sm:text-lg">
                      <span className="tabular-nums">#{sample.id}</span>{' '}
                      <span className={sample.status === 'fail' ? 'text-hold' : 'text-look'}>
                        {statusWord}
                      </span>
                      <span className="font-medium text-ink">
                        {' '}
                        — {sample.drive.listLine}
                      </span>
                    </p>
                  </button>
                  <RowAction
                    sample={sample}
                    disposition={disposition}
                    onSendToDerek={onSendToDerek}
                    onHold={onHold}
                  />
                </div>
              </li>
            )
          }

          // 20-minute: all six with bars; pass rows get Accept only once at batch level for the two — user said "Accept only on the two passing rows, once"
          return (
            <li key={sample.id}>
              <div
                className={`rounded-2xl border border-line border-l-4 bg-panel shadow-sm ${shownMeta.row}`}
              >
                <button
                  type="button"
                  onClick={() => onOpenSample(sample.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-line/60 px-4 py-3 text-left hover:bg-surface/80"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xl font-bold tabular-nums text-ink">#{sample.id}</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${shownMeta.chip}`}
                    >
                      {dispositionLabel(disposition, sample)}
                    </span>
                  </div>
                </button>

                <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {PROPERTY_ORDER.map((key) => (
                      <div key={key} className="rounded-lg bg-surface/80 p-2.5">
                        <SpecBar
                          propertyKey={key}
                          value={sample.values[key]}
                          status={sample.propertyStatus[key]}
                          band={sample.bands[key]}
                          size="md"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-end md:min-w-[11rem]">
                    {sample.status === 'pass' ? (
                      dispositions[sample.id] === 'accepted' || passingAccepted ? (
                        <span className="inline-flex min-h-14 items-center justify-center rounded-xl bg-pass-bg px-4 text-sm font-semibold text-pass">
                          Accepted
                        </span>
                      ) : sample.id === passing[0]?.id ? (
                        <button
                          type="button"
                          onClick={onAcceptPassing}
                          className="min-h-14 rounded-xl bg-pass px-4 text-base font-semibold text-white hover:bg-green-800"
                        >
                          Accept
                        </button>
                      ) : null
                    ) : (
                      <RowAction
                        sample={sample}
                        disposition={disposition}
                        onSendToDerek={onSendToDerek}
                        onHold={onHold}
                      />
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
