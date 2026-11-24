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

const MOVE_MS = 420
const DROP_MS = 480

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Snapshot card positions before a list move (FLIP). */
function captureCardPositions() {
  const map = new Map()
  document.querySelectorAll('[data-sample-card]').forEach((el) => {
    map.set(el.getAttribute('data-sample-card'), el.getBoundingClientRect())
  })
  return map
}

/**
 * Animate cards from previous positions to their new layout.
 * Completing cards drop downward; remaining pending cards ease upward.
 */
function playCardMoveAnimations(prevRects, movedId) {
  if (prefersReducedMotion() || !prevRects?.size) return

  document.querySelectorAll('[data-sample-card]').forEach((el) => {
    const id = el.getAttribute('data-sample-card')
    const next = el.getBoundingClientRect()
    const prev = prevRects.get(id)

    if (!prev) {
      // First appearance in Decisions made — drop in from above.
      if (String(movedId) === id) {
        el.animate(
          [
            { transform: 'translateY(-28px) scale(0.98)', opacity: 0.55 },
            { transform: 'translateY(8px) scale(1)', opacity: 1, offset: 0.72 },
            { transform: 'translateY(0) scale(1)', opacity: 1 },
          ],
          {
            duration: DROP_MS,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both',
          },
        )
      }
      return
    }

    const dy = prev.top - next.top
    const dx = prev.left - next.left
    if (Math.abs(dy) < 1 && Math.abs(dx) < 1) return

    const isDropping = String(movedId) === id && dy < -8
    el.animate(
      [
        {
          transform: `translate(${dx}px, ${dy}px)${isDropping ? ' scale(0.985)' : ''}`,
          opacity: isDropping ? 0.92 : 1,
        },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      ],
      {
        duration: isDropping ? DROP_MS : MOVE_MS,
        easing: isDropping
          ? 'cubic-bezier(0.33, 1.15, 0.45, 1)'
          : 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      },
    )
  })

  const separator = document.querySelector('[data-testid="decisions-separator"]')
  if (separator && !prevRects.has('__separator__')) {
    separator.animate(
      [
        { opacity: 0, transform: 'scaleX(0.92)' },
        { opacity: 1, transform: 'scaleX(1)' },
      ],
      { duration: 280, easing: 'ease-out', fill: 'both' },
    )
  }
}

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

function CompletedDecision({ sample, decision, onRevert }) {
  const isAccept = decision === DECISION.accepted
  const label = isAccept ? 'Accept' : 'Send for rework'
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div
        role="status"
        className={`inline-flex min-h-12 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white ${
          isAccept ? 'bg-pass ring-2 ring-pass ring-offset-2' : 'bg-hold ring-2 ring-hold ring-offset-2'
        }`}
      >
        <span className="sr-only">Recorded decision for sample #{sample.id}: </span>
        {label}
      </div>
      <button
        type="button"
        onClick={() => onRevert(sample.id)}
        className="min-h-11 rounded px-1 text-sm font-medium text-engineer underline decoration-engineer/50 underline-offset-2 hover:decoration-engineer"
        aria-label={`Revert decision for sample #${sample.id}`}
      >
        Revert
      </button>
    </div>
  )
}

function SampleCard({
  sample,
  decision,
  completed = false,
  onAccept,
  onRework,
  onEngineer,
  onRevert,
}) {
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

      {!completed ? (
        <div className="mt-3 border-t border-line pt-3">
          <Recommendation suggestion={sample.suggestion} />
        </div>
      ) : null}

      <div className="mt-3">
        {completed ? (
          <CompletedDecision sample={sample} decision={decision} onRevert={onRevert} />
        ) : (
          <DecisionActions
            sample={sample}
            decision={decision}
            onAccept={onAccept}
            onRework={onRework}
            onEngineer={onEngineer}
          />
        )}
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
  onRevert,
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
  const flipRef = useRef(null)

  useLayoutEffect(() => {
    const flip = flipRef.current
    if (flip) {
      flipRef.current = null
      playCardMoveAnimations(flip.prevRects, flip.movedId)
    }

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
      // Keep focus in the pending list so the drop animation can play without a jump-scroll.
      if (target) {
        focusEl(
          document.querySelector(`[data-sample-actions="${target.id}"] [data-action="accept"]`),
        )
      } else {
        focusEl(document.querySelector('[data-testid="batch-complete-message"]'))
      }
      return
    }

    if (plan.kind === 'after-revert') {
      focusEl(
        document.querySelector(
          `[data-sample-actions="${plan.sampleId}"] [data-action="accept"]`,
        ),
      )
    }
  }, [decisions, samples])

  const beginListMove = (id, focusKind, commit) => {
    const prevRects = captureCardPositions()
    if (document.querySelector('[data-testid="decisions-separator"]')) {
      prevRects.set('__separator__', true)
    }
    flipRef.current = { prevRects, movedId: id }
    focusPlanRef.current = { kind: focusKind, sampleId: id }
    commit(id)
  }

  const handleAccept = (id) => beginListMove(id, 'after-complete', onAccept)
  const handleRework = (id) => beginListMove(id, 'after-complete', onRework)
  const handleRevert = (id) => beginListMove(id, 'after-revert', onRevert)

  const handleEngineer = (id) => {
    // Stays in Pending — light settle only, no section move.
    if (!prefersReducedMotion()) {
      const el = document.querySelector(`[data-sample-card="${id}"]`)
      el?.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.985)' },
          { transform: 'scale(1)' },
        ],
        { duration: 220, easing: 'ease-out' },
      )
    }
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
          <ul className="sample-list mt-3 space-y-3">
            {pending.map((sample) => {
              const decision = getDecision(decisions, sample.id)
              return (
                <li key={sample.id} className="sample-list-item">
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
            <ul className="sample-list mt-3 space-y-3">
              {completed.map((sample) => {
                const decision = getDecision(decisions, sample.id)
                return (
                  <li key={sample.id} className="sample-list-item">
                    <SampleCard
                      sample={sample}
                      decision={decision}
                      completed
                      onRevert={handleRevert}
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
