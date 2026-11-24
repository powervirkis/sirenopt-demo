import { useLayoutEffect, useRef } from 'react'
import {
  BATCH,
  DECISION,
  DECISION_META,
  PROPERTIES,
  PROPERTY_ORDER,
  SUGGESTION_META,
  VISUAL_META,
  formatValue,
  getDecision,
  summarizeDecisions,
} from '../data'
import DisplayToggle from './DisplayToggle'

function MeasurementKey() {
  return (
    <p className="mt-2 text-sm text-muted" data-testid="measurement-key">
      Units: Mass loading {PROPERTIES.massLoading.unit} · Sheet resistance{' '}
      {PROPERTIES.sheetResistance.unit} · Porosity {PROPERTIES.porosity.unit}
    </p>
  )
}

function StatusIcon({ visual }) {
  const meta = VISUAL_META[visual] || VISUAL_META.unavailable
  return (
    <span className={`inline-flex max-w-[9.5rem] flex-wrap items-baseline gap-x-1 font-semibold ${meta.className}`}>
      <span className="text-base leading-none" aria-hidden="true">
        {meta.symbol}
      </span>
      {meta.label ? (
        <span className="text-sm leading-snug" aria-hidden="true">
          {meta.label}
        </span>
      ) : null}
    </span>
  )
}

function MeasurementRows({ sample }) {
  return (
    <ul className="divide-y divide-line/70">
      {PROPERTY_ORDER.map((key) => {
        const p = PROPERTIES[key]
        const visual = sample.visualStatus[key]
        const meta = VISUAL_META[visual] || VISUAL_META.unavailable
        const display =
          visual === 'unavailable'
            ? '—'
            : `${formatValue(key, sample.values[key])}${p.showUnitOnMaya ? p.unit : ''}`
        const a11y = `${p.label}: ${
          visual === 'unavailable'
            ? 'unavailable'
            : `${formatValue(key, sample.values[key])} ${p.unit}, ${meta.meaning}`
        }`

        return (
          <li
            key={key}
            className="flex items-baseline justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
          >
            <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-muted">
              {p.label}
            </span>
            <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
              <span className="text-lg font-semibold leading-none text-ink" aria-hidden="true">
                {display}
              </span>
              <span aria-hidden="true">
                <StatusIcon visual={visual} />
              </span>
              <span className="sr-only">{a11y}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Recommendation({ suggestion }) {
  const meta = SUGGESTION_META[suggestion.kind]
  return (
    <div className="min-w-0">
      <p className={`text-sm font-semibold ${meta.className}`}>
        <span className="sr-only">Recommendation: </span>
        {meta.label}
      </p>
      {suggestion.reason ? (
        <p className="text-sm text-muted">{suggestion.reason}</p>
      ) : null}
    </div>
  )
}

function DecisionActions({ sample, decision, onAccept, onRework, onEngineer }) {
  const suggested = sample.suggestion.kind
  const base =
    'relative flex min-h-12 items-center justify-center rounded-lg px-3 text-sm font-semibold leading-snug'

  const acceptActive = decision === DECISION.accepted
  const reworkActive = decision === DECISION.rework
  const engineerActive = decision === DECISION.engineer

  const suggestedBadge = (kind) =>
    suggested === kind && !acceptActive && !reworkActive && !engineerActive ? (
      <span className="absolute -top-2 right-2 rounded bg-ink px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
        Suggested
      </span>
    ) : null

  const emphasize = (kind, active) => {
    if (active) return ''
    return suggested === kind ? 'ring-2 ring-offset-1 ' : ''
  }

  return (
    <div
      className="decision-actions grid grid-cols-2 gap-2"
      role="group"
      aria-label={`Decision for sample #${sample.id}`}
      data-sample-actions={sample.id}
    >
      <button
        type="button"
        data-action="accept"
        aria-pressed={acceptActive}
        aria-label={`Accept sample #${sample.id}`}
        onClick={() => onAccept(sample.id)}
        className={`${base} ${emphasize('accept', acceptActive)} ${
          acceptActive
            ? 'bg-pass text-white ring-2 ring-pass ring-offset-2'
            : suggested === 'accept'
              ? 'border-2 border-pass bg-pass-bg text-pass ring-pass'
              : 'border-2 border-pass text-pass hover:bg-pass-bg'
        }`}
      >
        {suggestedBadge('accept')}
        Accept
      </button>
      <button
        type="button"
        data-action="rework"
        aria-pressed={reworkActive}
        aria-label={`Send sample #${sample.id} for rework`}
        onClick={() => onRework(sample.id)}
        className={`${base} ${emphasize('rework', reworkActive)} ${
          reworkActive
            ? 'bg-hold text-white ring-2 ring-hold ring-offset-2'
            : suggested === 'rework'
              ? 'border-2 border-hold bg-hold-bg text-hold ring-hold'
              : 'border-2 border-hold text-hold hover:bg-hold-bg'
        }`}
      >
        {suggestedBadge('rework')}
        Send for rework
      </button>
      <button
        type="button"
        data-action="engineer"
        aria-pressed={engineerActive}
        aria-label={`Send sample #${sample.id} to engineer`}
        onClick={() => onEngineer(sample.id)}
        className={`${base} col-span-2 ${emphasize('engineer', engineerActive)} ${
          engineerActive
            ? 'bg-engineer text-white ring-2 ring-engineer ring-offset-2'
            : suggested === 'engineer'
              ? 'border-2 border-engineer bg-engineer-bg text-engineer ring-engineer'
              : 'border-2 border-engineer text-engineer hover:bg-engineer-bg'
        }`}
      >
        {suggestedBadge('engineer')}
        Send to engineer
      </button>
    </div>
  )
}

function SampleCard({ sample, decision, onAccept, onRework, onEngineer }) {
  const decisionMeta = DECISION_META[decision]
  return (
    <article
      className="rounded-xl border border-line bg-panel p-3.5 shadow-sm sm:p-4"
      aria-labelledby={`sample-${sample.id}-title`}
      data-sample-card={sample.id}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2
          id={`sample-${sample.id}-title`}
          className="text-xl font-bold tabular-nums text-ink"
        >
          #{sample.id}
          <span className="sr-only"> — {decisionMeta.label}</span>
        </h2>
        <p className={`text-sm font-semibold ${decisionMeta.className}`} aria-hidden="true">
          {decisionMeta.label}
        </p>
      </div>

      <div className="mt-2">
        <MeasurementRows sample={sample} />
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <Recommendation suggestion={sample.suggestion} />
      </div>

      <div className="mt-3">
        <DecisionActions
          sample={sample}
          decision={decision}
          onAccept={onAccept}
          onRework={onRework}
          onEngineer={onEngineer}
        />
      </div>
    </article>
  )
}

function ProgressSummary({ counts }) {
  if (counts.complete) {
    return (
      <p
        className="rounded-xl border border-line bg-panel px-4 py-3 text-base font-medium text-ink"
        aria-live="polite"
        data-testid="decision-progress"
      >
        Batch review complete · {counts.accepted} accepted · {counts.rework} sent for rework
      </p>
    )
  }

  return (
    <p
      className="rounded-xl border border-line bg-panel px-4 py-3 text-base font-medium text-ink"
      aria-live="polite"
      data-testid="decision-progress"
    >
      <span className="font-bold">{counts.unresolved} unresolved</span>
      <span className="text-muted">
        {' '}
        · {counts.awaiting} awaiting decision · {counts.engineer} awaiting engineer ·{' '}
        {counts.accepted} accepted · {counts.rework} rework
      </span>
    </p>
  )
}

function isPendingDecision(decision) {
  return decision === DECISION.awaiting || decision === DECISION.engineer
}

function isCompletedDecision(decision) {
  return decision === DECISION.accepted || decision === DECISION.rework
}

export default function MayaView({
  samples,
  decisions,
  onAccept,
  onRework,
  onEngineer,
  statusMessage,
  largeText,
  highContrast,
  onToggleLargeText,
  onToggleHighContrast,
}) {
  const counts = summarizeDecisions(samples, decisions)
  const pending = samples.filter((s) => isPendingDecision(getDecision(decisions, s.id)))
  const completed = samples.filter((s) => isCompletedDecision(getDecision(decisions, s.id)))
  const focusPlanRef = useRef(null)

  useLayoutEffect(() => {
    const plan = focusPlanRef.current
    if (!plan) return
    focusPlanRef.current = null

    const focusEl = (el) => {
      if (el && typeof el.focus === 'function') {
        el.focus({ preventScroll: true })
      }
    }

    if (plan.kind === 'stay-engineer') {
      focusEl(
        document.querySelector(
          `[data-sample-actions="${plan.sampleId}"] [data-action="engineer"]`,
        ),
      )
      return
    }

    if (plan.kind === 'after-complete') {
      const nextPending = samples.filter((s) => isPendingDecision(getDecision(decisions, s.id)))
      const after = nextPending.find((s) => s.id > plan.sampleId)
      const target = after || nextPending[0]
      if (target) {
        focusEl(
          document.querySelector(`[data-sample-actions="${target.id}"] [data-action="accept"]`),
        )
      } else {
        focusEl(document.querySelector('[data-testid="batch-complete-message"]'))
      }
    }
  }, [decisions, samples])

  const handleAccept = (id) => {
    focusPlanRef.current = { kind: 'after-complete', sampleId: id }
    onAccept(id)
  }

  const handleRework = (id) => {
    focusPlanRef.current = { kind: 'after-complete', sampleId: id }
    onRework(id)
  }

  const handleEngineer = (id) => {
    focusPlanRef.current = { kind: 'stay-engineer', sampleId: id }
    onEngineer(id)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 pb-16 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            PlasmaSmart™ · Maya
          </p>
          <h1 className="text-2xl font-bold text-ink">Batch {BATCH.id}</h1>
          <p className="mt-1 text-base text-muted">
            {BATCH.line} · {BATCH.product} · {BATCH.shift}
          </p>
          <MeasurementKey />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Display">
          <DisplayToggle
            label="Large text"
            pressed={largeText}
            onClick={onToggleLargeText}
          />
          <DisplayToggle
            label="High contrast"
            pressed={highContrast}
            onClick={onToggleHighContrast}
          />
        </div>
      </header>

      <ProgressSummary counts={counts} />

      {statusMessage ? (
        <p className="text-base text-muted" role="status">
          {statusMessage}
        </p>
      ) : null}

      <section aria-labelledby="pending-heading" data-testid="pending-section">
        <h2 id="pending-heading" className="text-lg font-bold text-ink">
          Pending decisions ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p
            className="mt-3 rounded-xl border border-pass/40 bg-pass-bg px-4 py-3 text-base font-medium text-pass"
            tabIndex={-1}
            data-testid="batch-complete-message"
          >
            All samples decided. Batch review complete.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {pending.map((sample) => {
              const decision = getDecision(decisions, sample.id)
              return (
                <li key={sample.id}>
                  <SampleCard
                    sample={sample}
                    decision={decision}
                    onAccept={handleAccept}
                    onRework={handleRework}
                    onEngineer={handleEngineer}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {completed.length > 0 ? (
        <>
          <hr className="border-t-2 border-line" data-testid="decisions-separator" />
          <section aria-labelledby="completed-heading" data-testid="completed-section">
            <h2 id="completed-heading" className="text-lg font-bold text-ink">
              Decisions made ({completed.length})
            </h2>
            <ul className="mt-3 space-y-3">
              {completed.map((sample) => {
                const decision = getDecision(decisions, sample.id)
                return (
                  <li key={sample.id}>
                    <SampleCard
                      sample={sample}
                      decision={decision}
                      onAccept={handleAccept}
                      onRework={handleRework}
                      onEngineer={handleEngineer}
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
