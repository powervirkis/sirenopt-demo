import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ACTOR,
  ACTOR_META,
  BATCH,
  DECISION,
  DECISION_META,
  PROPERTIES,
  PROPERTY_ORDER,
  SUGGESTION_META,
  VERDICT_META,
  VISUAL_META,
  canMayaDecide,
  canReopen,
  formatValue,
  getCase,
  isCompletedState,
  isPendingState,
  mayaDecisionNeedsOverride,
  operatorReasonDisplay,
  summarizeCases,
} from '../data'
import EscalationSheet from './EscalationSheet'
import MayaQuickView from './MayaQuickView'
import OverrideSheet from './OverrideSheet'

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
        const specLabel = `spec ${formatValue(key, p.min)}–${formatValue(key, p.max)}${
          p.showUnitOnMaya ? p.unit : ` ${p.unit}`
        }`
        const a11y = `${p.label}: ${
          visual === 'unavailable'
            ? 'unavailable'
            : `${formatValue(key, sample.values[key])} ${p.unit}, ${meta.meaning}; ${specLabel}`
        }`

        return (
          <li
            key={key}
            className="flex items-baseline justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
          >
            <span className="min-w-0 flex-1 leading-snug">
              <span className="block text-sm font-medium text-muted">{p.label}</span>
              <span className="block text-xs text-muted/80">{specLabel}</span>
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
        className={`${base} focus-target col-span-2 ${emphasize('engineer', engineerActive)} ${
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

function EscalatedStatus({ sample, caseRecord }) {
  const owner = ACTOR_META[caseRecord.owner]?.short || 'Derek'
  const stateMeta = DECISION_META[caseRecord.state]
  return (
    <div
      tabIndex={-1}
      data-sample-status={sample.id}
      className="focus-target space-y-2 rounded-xl border border-engineer/30 bg-engineer-bg/40 p-3"
    >
      <p className={`text-sm font-semibold ${stateMeta.className}`}>
        {stateMeta.label} · {owner}
      </p>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">System finding</p>
        <p className="text-sm text-ink">
          {caseRecord.escalation?.systemFinding || 'System finding unavailable.'}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Maya&apos;s reason</p>
        <p className="text-sm text-ink">{operatorReasonDisplay(caseRecord.escalation)}</p>
        {caseRecord.escalation?.operatorNote ? (
          <p className="break-words text-sm text-ink">{caseRecord.escalation.operatorNote}</p>
        ) : null}
      </div>
      {caseRecord.state === DECISION.verification && caseRecord.verification ? (
        <p className="text-sm text-look">
          Waiting for {caseRecord.verification.responsible}: {caseRecord.verification.what}
        </p>
      ) : null}
    </div>
  )
}

function CompletedRecord({ sample, caseRecord, onReopen }) {
  const disposition = caseRecord.disposition
  const isAccept = disposition?.kind === DECISION.accepted
  const canOpen = canReopen(caseRecord, ACTOR.maya)
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div
          role="status"
          className={`inline-flex min-h-12 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white ${
            isAccept
              ? 'bg-pass ring-2 ring-pass ring-offset-2'
              : 'bg-hold ring-2 ring-hold ring-offset-2'
          }`}
        >
          {isAccept ? 'Accept' : 'Send for rework'}
        </div>
        {canOpen ? (
          <button
            type="button"
            data-action="reopen"
            onClick={() => onReopen(sample.id)}
            className="min-h-11 rounded px-1 text-sm font-medium text-engineer underline decoration-engineer/50 underline-offset-2 hover:decoration-engineer"
            aria-label={`Reopen decision for sample #${sample.id}`}
          >
            Reopen
          </button>
        ) : null}
      </div>
      <p className="text-sm text-muted">
        {disposition?.authorLabel || 'Unknown'} · {disposition?.reason || 'No reason recorded.'}
      </p>
    </div>
  )
}

function SampleCard({
  sample,
  caseRecord,
  onAccept,
  onRework,
  onRequestEscalate,
  onReopen,
}) {
  const decisionMeta = DECISION_META[caseRecord.state]
  const editable = canMayaDecide(caseRecord)
  const escalated =
    caseRecord.owner === ACTOR.derek &&
    (caseRecord.state === DECISION.engineer || caseRecord.state === DECISION.verification)
  const completed = isCompletedState(caseRecord.state)
  const statusLabel = escalated
    ? `${decisionMeta.label} · ${ACTOR_META[caseRecord.owner].short}`
    : decisionMeta.label

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
          <span className="sr-only"> — {statusLabel}</span>
        </h2>
        <p className={`text-sm font-semibold ${decisionMeta.className}`} aria-hidden="true">
          {statusLabel}
        </p>
      </div>

      <div className="mt-2">
        <MeasurementRows sample={sample} />
      </div>

      {editable ? (
        <>
          <div className="mt-3 border-t border-line pt-3">
            <Recommendation suggestion={sample.suggestion} />
          </div>
          <div className="mt-3">
            <DecisionActions
              sample={sample}
              decision={caseRecord.state}
              onAccept={onAccept}
              onRework={onRework}
              onEngineer={onRequestEscalate}
            />
          </div>
        </>
      ) : null}

      {escalated ? (
        <div className="mt-3 border-t border-line pt-3">
          <EscalatedStatus sample={sample} caseRecord={caseRecord} />
        </div>
      ) : null}

      {completed ? (
        <div className="mt-3 border-t border-line pt-3">
          <CompletedRecord sample={sample} caseRecord={caseRecord} onReopen={onReopen} />
        </div>
      ) : null}
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

  const parts = []
  if (counts.awaiting) parts.push(`${counts.awaiting} awaiting decision`)
  if (counts.engineer) parts.push(`${counts.engineer} awaiting engineer`)
  if (counts.verification) parts.push(`${counts.verification} awaiting verification`)
  if (counts.accepted) parts.push(`${counts.accepted} accepted`)
  if (counts.rework) parts.push(`${counts.rework} rework`)

  return (
    <p
      className="rounded-xl border border-line bg-panel px-4 py-3 text-base font-medium text-ink"
      aria-live="polite"
      data-testid="decision-progress"
    >
      <span className="font-bold">{counts.unresolved} to decide</span>
      {parts.length > 0 ? (
        <span className="text-muted"> · {parts.join(' · ')}</span>
      ) : null}
    </p>
  )
}

function BatchGlance({ samples, cases }) {
  const scrollTo = (id) => {
    document.querySelector(`[data-sample-card="${id}"]`)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'nearest',
    })
  }

  return (
    <section
      className="overflow-x-auto rounded-xl border border-line bg-panel"
      aria-labelledby="batch-glance-heading"
      data-testid="batch-glance"
    >
      <div className="border-b border-line px-4 py-3">
        <h2 id="batch-glance-heading" className="text-lg font-bold text-ink">
          Batch at a glance
        </h2>
        <p className="text-sm text-muted">
          Pass, fail, or second look across all three properties. Open a row for the full card.
        </p>
      </div>
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface text-muted">
            <th className="px-4 py-2 font-semibold">Sample</th>
            {PROPERTY_ORDER.map((key) => (
              <th key={key} className="px-3 py-2 font-semibold">
                {PROPERTIES[key].short}
              </th>
            ))}
            <th className="px-4 py-2 font-semibold">Verdict</th>
            <th className="px-4 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((sample) => {
            const caseRecord = getCase(cases, sample.id)
            const verdict = VERDICT_META[sample.suggestion.kind]
            const stateMeta = DECISION_META[caseRecord.state]
            const statusLabel =
              caseRecord.owner === ACTOR.derek
                ? `${stateMeta.label} · ${ACTOR_META[caseRecord.owner].short}`
                : stateMeta.label
            return (
              <tr
                key={sample.id}
                className="border-b border-line/70 last:border-b-0 hover:bg-surface/80"
              >
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => scrollTo(sample.id)}
                    className="text-base font-bold tabular-nums text-ink underline-offset-2 hover:underline"
                  >
                    #{sample.id}
                  </button>
                </td>
                {PROPERTY_ORDER.map((key) => {
                  const visual = sample.visualStatus[key]
                  const meta = VISUAL_META[visual] || VISUAL_META.unavailable
                  return (
                    <td key={key} className="px-3 py-2.5">
                      <span className={`inline-flex items-baseline gap-1 font-semibold ${meta.className}`}>
                        <span aria-hidden="true">{meta.symbol}</span>
                        <span className="sr-only">
                          {PROPERTIES[key].label}: {meta.meaning || meta.label || visual}
                        </span>
                        {meta.label ? (
                          <span className="text-xs font-medium" aria-hidden="true">
                            {meta.label}
                          </span>
                        ) : null}
                      </span>
                    </td>
                  )
                })}
                <td className={`px-4 py-2.5 font-semibold ${verdict.className}`}>
                  {verdict.label}
                </td>
                <td className={`px-4 py-2.5 text-sm ${stateMeta.className}`}>{statusLabel}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

export default function MayaView({
  samples,
  cases,
  mode = '20min',
  onModeChange,
  onAccept,
  onRework,
  onAcceptSuggested,
  onEscalate,
  onReopen,
  statusMessage,
}) {
  const counts = summarizeCases(samples, cases)
  const pending = samples.filter((s) => isPendingState(getCase(cases, s.id).state))
  const completed = samples.filter((s) => isCompletedState(getCase(cases, s.id).state))
  const [escalateSampleId, setEscalateSampleId] = useState(null)
  const [overrideRequest, setOverrideRequest] = useState(null)
  const escalateSample = samples.find((s) => s.id === escalateSampleId) || null
  const overrideSample = samples.find((s) => s.id === overrideRequest?.id) || null
  const focusPlanRef = useRef(null)
  const flipRef = useRef(null)
  const isQuick = mode === '2min'

  useLayoutEffect(() => {
    const flip = flipRef.current
    if (flip) {
      flipRef.current = null
      playCardMoveAnimations(flip.prevRects, flip.movedId)
    }

    const plan = focusPlanRef.current
    if (!plan || plan.kind === 'after-escalate') return
    focusPlanRef.current = null

    const focusEl = (el) => {
      if (el && typeof el.focus === 'function') {
        el.focus({ preventScroll: true })
      }
    }

    if (plan.kind === 'after-complete') {
      const nextPending = samples.filter((s) => getCase(cases, s.id).state === DECISION.awaiting)
      const after = nextPending.find((s) => s.id > plan.sampleId)
      const target = after || nextPending[0]
      if (target) {
        focusEl(
          document.querySelector(`[data-sample-actions="${target.id}"] [data-action="accept"]`),
        )
      } else {
        focusEl(document.querySelector('[data-testid="batch-complete-message"]'))
      }
      return
    }

    if (plan.kind === 'after-reopen') {
      focusEl(
        document.querySelector(
          `[data-sample-actions="${plan.sampleId}"] [data-action="accept"]`,
        ),
      )
    }
  }, [cases, samples])

  useEffect(() => {
    const plan = focusPlanRef.current
    if (!plan || plan.kind !== 'after-escalate') return
    focusPlanRef.current = null
    document.querySelector(`[data-sample-status="${plan.sampleId}"]`)?.focus()
  }, [cases, samples])

  const beginListMove = (id, focusKind, commit) => {
    const prevRects = captureCardPositions()
    if (document.querySelector('[data-testid="decisions-separator"]')) {
      prevRects.set('__separator__', true)
    }
    flipRef.current = { prevRects, movedId: id }
    focusPlanRef.current = { kind: focusKind, sampleId: id }
    commit(id)
  }

  const decideOrAskReason = (id, disposition, commit) => {
    const sample = samples.find((s) => s.id === id)
    if (sample && mayaDecisionNeedsOverride(sample, disposition)) {
      setOverrideRequest({ id, disposition })
      return
    }
    beginListMove(id, 'after-complete', commit)
  }
  const handleAccept = (id) => decideOrAskReason(id, DECISION.accepted, onAccept)
  const handleRework = (id) => decideOrAskReason(id, DECISION.rework, onRework)
  const handleReopen = (id) => beginListMove(id, 'after-reopen', onReopen)
  const handleConfirmOverride = ({ reason }) => {
    if (!overrideSample) return
    const id = overrideSample.id
    const commit = overrideRequest.disposition === DECISION.accepted ? onAccept : onRework
    setOverrideRequest(null)
    beginListMove(id, 'after-complete', (sampleId) => commit(sampleId, { reason }))
  }
  const handleOverrideEscalate = () => {
    if (!overrideSample) return
    const id = overrideSample.id
    setOverrideRequest(null)
    setEscalateSampleId(id)
  }
  const handleAcceptSuggested = () => {
    const prevRects = captureCardPositions()
    if (document.querySelector('[data-testid="decisions-separator"]')) {
      prevRects.set('__separator__', true)
    }
    flipRef.current = { prevRects, movedId: null }
    onAcceptSuggested?.()
  }

  const handleConfirmEscalate = ({ reasonId, note }) => {
    if (!escalateSample) return
    const id = escalateSample.id
    setEscalateSampleId(null)
    if (!prefersReducedMotion()) {
      document.querySelector(`[data-sample-card="${id}"]`)?.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.985)' },
          { transform: 'scale(1)' },
        ],
        { duration: 220, easing: 'ease-out' },
      )
    }
    focusPlanRef.current = { kind: 'after-escalate', sampleId: id }
    onEscalate(id, { reasonId, note })
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
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div
            className="flex rounded-xl border-2 border-line bg-surface p-1"
            role="radiogroup"
            aria-label="Review time"
          >
            <button
              type="button"
              role="radio"
              aria-checked={mode === '2min'}
              onClick={() => onModeChange?.('2min')}
              className={`min-h-12 rounded-lg px-4 text-base font-semibold ${
                mode === '2min' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
              }`}
            >
              2 min
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === '20min'}
              onClick={() => onModeChange?.('20min')}
              className={`min-h-12 rounded-lg px-4 text-base font-semibold ${
                mode === '20min' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
              }`}
            >
              20 min
            </button>
          </div>
        </div>
      </header>

      {!isQuick ? <ProgressSummary counts={counts} /> : null}

      {statusMessage ? (
        <p className="text-base text-muted" role="status">
          {statusMessage}
        </p>
      ) : null}

      {isQuick ? (
        <MayaQuickView
          samples={samples}
          cases={cases}
          onAccept={handleAccept}
          onRework={handleRework}
          onAcceptSuggested={handleAcceptSuggested}
          onRequestEscalate={setEscalateSampleId}
          onReopen={handleReopen}
        />
      ) : (
        <>
          <BatchGlance samples={samples} cases={cases} />

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
                Batch review complete · {counts.accepted} accepted · {counts.rework} sent for rework
              </p>
            ) : (
              <ul className="sample-list mt-3 space-y-3">
                {pending.map((sample) => (
                  <li key={sample.id} className="sample-list-item">
                    <SampleCard
                      sample={sample}
                      caseRecord={getCase(cases, sample.id)}
                      onAccept={handleAccept}
                      onRework={handleRework}
                      onRequestEscalate={setEscalateSampleId}
                    />
                  </li>
                ))}
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
                  {completed.map((sample) => (
                    <li key={sample.id} className="sample-list-item">
                      <SampleCard
                        sample={sample}
                        caseRecord={getCase(cases, sample.id)}
                        onReopen={handleReopen}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}
        </>
      )}

      {escalateSample ? (
        <EscalationSheet
          sample={escalateSample}
          onConfirm={handleConfirmEscalate}
          onCancel={() => setEscalateSampleId(null)}
        />
      ) : null}

      {overrideSample ? (
        <OverrideSheet
          sample={overrideSample}
          disposition={overrideRequest.disposition}
          onConfirm={handleConfirmOverride}
          onCancel={() => setOverrideRequest(null)}
          onEscalate={handleOverrideEscalate}
        />
      ) : null}
    </div>
  )
}
