import {
  BATCH,
  DECISION_RULE_COPY,
  DISPOSITION,
  ILLUSTRATIVE_DISCLOSURE,
  PROPERTY_ORDER,
  RESULT_META,
  canAccept,
  getDisposition,
  summarize,
} from '../data'
import SpecBar, { ChartLegend } from './SpecBar'
import { DispositionChip, ResultChip } from './StatusChip'

function RowActions({
  sample,
  dispositions,
  onAcceptOne,
  onHold,
  onRequestReview,
  onViewEngineer,
  onOpenSample,
}) {
  const result = sample.result || (sample.status === 'look' ? 'review' : sample.status)
  const disposition = getDisposition(dispositions, sample.id)

  if (result === 'pass') {
    if (disposition === DISPOSITION.accepted) {
      return (
        <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-pass-bg px-4 text-sm font-semibold text-pass">
          Accepted
        </span>
      )
    }
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onAcceptOne(sample.id)
        }}
        className="min-h-11 min-w-[8rem] rounded-xl bg-pass px-4 text-base font-semibold text-white hover:bg-green-800"
      >
        Accept #{sample.id}
      </button>
    )
  }

  if (result === 'fail') {
    return (
      <div className="flex flex-wrap gap-2">
        {disposition !== DISPOSITION.held ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onHold(sample.id)
            }}
            className="min-h-11 rounded-xl bg-hold px-4 text-base font-semibold text-white hover:bg-red-800"
          >
            Hold #{sample.id}
          </button>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-xl bg-hold-bg px-4 text-sm font-semibold text-hold">
            Held
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewEngineer(sample.id)
          }}
          className="min-h-11 rounded-xl border-2 border-ink bg-panel px-3 text-sm font-semibold text-ink hover:bg-surface"
        >
          View engineer detail
        </button>
      </div>
    )
  }

  // needs review
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onViewEngineer(sample.id)
        }}
        className="min-h-11 rounded-xl border-2 border-ink bg-panel px-3 text-sm font-semibold text-ink hover:bg-surface"
      >
        View engineer detail
      </button>
      {disposition !== DISPOSITION.review_requested ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRequestReview(sample.id)
          }}
          className="min-h-11 rounded-xl bg-look px-3 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Request review (simulated)
        </button>
      ) : (
        <span className="inline-flex min-h-11 items-center rounded-xl bg-look-bg px-3 text-sm font-semibold text-look">
          Review requested
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpenSample(sample.id)
        }}
        className="min-h-11 rounded-xl border border-line px-3 text-sm font-medium text-muted hover:bg-surface"
      >
        Open detail
      </button>
    </div>
  )
}

export default function BatchScreen({
  mode,
  samples,
  dispositions,
  onModeChange,
  onOpenSample,
  onAcceptOne,
  onAcceptEligible,
  onHold,
  onRequestReview,
  onViewEngineer,
  onShowReviewerNotes,
  onResetDemo,
  largeText,
  highContrast,
  onToggleLargeText,
  onToggleHighContrast,
  statusMessage,
}) {
  const counts = summarize(samples, dispositions)
  const passing = samples.filter((s) => s.result === 'pass')
  const eligibleCount = passing.filter((s) => canAccept(s, dispositions)).length

  const problems = samples
    .filter((s) => s.result === 'fail' || s.result === 'review')
    .sort((a, b) => {
      const rank = { fail: 0, review: 1 }
      return rank[a.result] - rank[b.result] || a.id - b.id
    })

  const listSamples = mode === '2min' ? problems : samples

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-4 p-4 pb-24 sm:p-6">
      <header className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">
              SirenOpt PlasmaSmart™ · Maya
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Batch results
            </h1>
            <p className="mt-1 text-base text-muted">
              {BATCH.line} · {BATCH.product} · Batch {BATCH.id} · {BATCH.shift}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <div
              className="flex rounded-xl border-2 border-line bg-surface p-1"
              role="radiogroup"
              aria-label="Review time mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={mode === '20min'}
                onClick={() => onModeChange('20min')}
                className={`min-h-11 rounded-lg px-4 text-base font-semibold ${
                  mode === '20min' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
                }`}
              >
                20 min
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={mode === '2min'}
                onClick={() => onModeChange('2min')}
                className={`min-h-11 rounded-lg px-4 text-base font-semibold ${
                  mode === '2min' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
                }`}
              >
                2 min
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={largeText}
                onClick={onToggleLargeText}
                className="min-h-11 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-surface"
              >
                Large text {largeText ? 'on' : 'off'}
              </button>
              <button
                type="button"
                aria-pressed={highContrast}
                onClick={onToggleHighContrast}
                className="min-h-11 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-surface"
              >
                High contrast {highContrast ? 'on' : 'off'}
              </button>
              <button
                type="button"
                onClick={onResetDemo}
                className="min-h-11 rounded-lg border border-dashed border-muted/50 px-3 text-sm font-medium text-muted hover:bg-surface"
              >
                Reset demo
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 rounded-lg border border-look/30 bg-look-bg/50 px-3 py-2 text-sm text-ink">
          {ILLUSTRATIVE_DISCLOSURE}
        </p>
        <p className="mt-2 text-sm text-muted">{DECISION_RULE_COPY}</p>
        <p className="mt-2 text-sm text-muted">
          Demo actions are session-only and clear on reload. Use Reset demo for a predictable walkthrough.
          Assumption: accepting passing samples does not release the batch while any sample is FAIL or
          NEEDS REVIEW.
        </p>
      </header>

      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3 shadow-sm"
        aria-live="polite"
      >
        <p className="text-base font-medium text-ink">
          <span className="text-pass">{counts.passingResults} passing results</span>
          <span className="mx-2 text-line">·</span>
          <span className="text-pass">{counts.ready} ready to accept</span>
          <span className="mx-2 text-line">·</span>
          <span className="text-pass">{counts.accepted} accepted</span>
          <span className="mx-2 text-line">·</span>
          <span className="text-look">{counts.needsReview} need review</span>
          <span className="mx-2 text-line">·</span>
          <span className="text-hold">{counts.fail} fail</span>
        </p>
        {mode === '2min' && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onModeChange('20min')}
              className="min-h-11 rounded-xl border-2 border-line px-4 text-sm font-semibold text-ink hover:bg-surface"
            >
              Full batch
            </button>
            <button
              type="button"
              onClick={onShowReviewerNotes}
              className="min-h-11 rounded-xl border border-dashed border-muted/40 px-3 text-sm font-medium text-muted hover:bg-surface"
            >
              What this view hides
            </button>
          </div>
        )}
      </div>

      {statusMessage && (
        <p className="rounded-xl border border-line bg-panel px-4 py-3 text-base font-medium text-ink" role="status">
          {statusMessage}
        </p>
      )}

      {/* Passing group — bulk accept lives only here */}
      <section
        className="rounded-2xl border border-pass/30 border-l-4 border-l-pass bg-pass-bg/40 p-4"
        aria-label="Passing samples"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-pass">
              {counts.passingResults} passing · #{passing.map((s) => s.id).join(' #')}
            </p>
            <p className="text-sm text-muted">
              {counts.ready} ready to accept · {counts.accepted} accepted
            </p>
          </div>
          {eligibleCount > 0 ? (
            <button
              type="button"
              onClick={onAcceptEligible}
              className="min-h-11 rounded-xl bg-pass px-4 text-base font-semibold text-white hover:bg-green-800"
            >
              {eligibleCount === 1
                ? 'Accept 1 passing sample'
                : `Accept ${eligibleCount} passing samples`}
            </button>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-xl bg-pass-bg px-4 text-sm font-semibold text-pass">
              All eligible passes accepted
            </span>
          )}
        </div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {passing.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onOpenSample(s.id)}
                className="min-h-11 rounded-lg border border-pass/40 bg-panel px-3 text-sm font-semibold text-ink hover:bg-surface"
              >
                #{s.id} · {getDisposition(dispositions, s.id) === DISPOSITION.accepted ? 'Accepted' : 'Open'}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {mode === '20min' && (
        <div className="rounded-xl border border-line bg-panel px-4 py-3">
          <ChartLegend />
        </div>
      )}

      <ul className="space-y-3">
        {listSamples.map((sample) => {
          const result = sample.result || (sample.status === 'look' ? 'review' : sample.status)
          const meta = RESULT_META[result]
          const disposition = getDisposition(dispositions, sample.id)

          if (mode === '2min') {
            return (
              <li key={sample.id}>
                <div
                  className={`flex w-full flex-col gap-3 rounded-2xl border border-line border-l-4 bg-panel p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${meta.row}`}
                >
                  <button
                    type="button"
                    onClick={() => onOpenSample(sample.id)}
                    className="min-h-11 min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-bold tabular-nums text-ink">#{sample.id}</span>
                      <ResultChip result={result} />
                      <DispositionChip disposition={disposition} />
                    </div>
                    <p className="mt-2 text-base font-medium text-ink">{sample.drive.cardReason}</p>
                  </button>
                  <RowActions
                    sample={sample}
                    dispositions={dispositions}
                    onAcceptOne={onAcceptOne}
                    onHold={onHold}
                    onRequestReview={onRequestReview}
                    onViewEngineer={onViewEngineer}
                    onOpenSample={onOpenSample}
                  />
                </div>
              </li>
            )
          }

          return (
            <li key={sample.id}>
              <article
                className={`rounded-2xl border border-line border-l-4 bg-panel shadow-sm ${meta.row}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onOpenSample(sample.id)}
                    className="flex min-h-11 min-w-0 flex-wrap items-center gap-3 text-left"
                  >
                    <span className="text-xl font-bold tabular-nums text-ink">#{sample.id}</span>
                    <ResultChip result={result} />
                    <DispositionChip disposition={disposition} />
                  </button>
                </div>

                {(result === 'review' || result === 'fail') && (
                  <p className="border-b border-line/40 bg-surface/80 px-4 py-2 text-base font-medium text-ink">
                    {sample.drive.cardReason}
                  </p>
                )}

                <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
                  <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
                    {PROPERTY_ORDER.map((key) => (
                      <div key={key} className="rounded-lg bg-surface/80 p-2.5">
                        <SpecBar
                          propertyKey={key}
                          value={sample.values[key]}
                          status={sample.propertyStatus[key]}
                          band={sample.bands[key]}
                          explanation={sample.explanations[key]}
                          size="md"
                        />
                        <p className="mt-1 text-xs text-muted sr-only md:not-sr-only md:text-xs">
                          {sample.explanations[key].text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-end">
                    <RowActions
                      sample={sample}
                      dispositions={dispositions}
                      onAcceptOne={onAcceptOne}
                      onHold={onHold}
                      onRequestReview={onRequestReview}
                      onViewEngineer={onViewEngineer}
                      onOpenSample={onOpenSample}
                    />
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
