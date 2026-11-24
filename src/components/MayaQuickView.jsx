import {
  ACTOR,
  ACTOR_META,
  DECISION,
  DECISION_META,
  SUGGESTION_META,
  canMayaDecide,
  canReopen,
  getCase,
  isCompletedState,
  operatorReasonDisplay,
} from '../data'

function suggestionRank(kind) {
  if (kind === 'rework') return 0
  if (kind === 'engineer') return 1
  return 2
}

function partitionForQuick(samples, cases) {
  const ready = []
  const needs = []
  const withDerek = []
  const completed = []

  samples.forEach((sample) => {
    const caseRecord = getCase(cases, sample.id)
    if (isCompletedState(caseRecord.state)) {
      completed.push({ sample, caseRecord })
      return
    }
    if (
      caseRecord.owner === ACTOR.derek &&
      (caseRecord.state === DECISION.engineer || caseRecord.state === DECISION.verification)
    ) {
      withDerek.push({ sample, caseRecord })
      return
    }
    if (!canMayaDecide(caseRecord)) return
    if (sample.suggestion.kind === 'accept') ready.push({ sample, caseRecord })
    else needs.push({ sample, caseRecord })
  })

  needs.sort(
    (a, b) =>
      suggestionRank(a.sample.suggestion.kind) - suggestionRank(b.sample.suggestion.kind) ||
      a.sample.id - b.sample.id,
  )

  return { ready, needs, withDerek, completed }
}

function CountLine({ ready, needs, withDerek, completed }) {
  const rework = needs.filter((item) => item.sample.suggestion.kind === 'rework').length
  const secondLook = needs.filter((item) => item.sample.suggestion.kind === 'engineer').length
  const toDecide = ready.length + needs.length
  const parts = []
  if (ready.length) parts.push(`${ready.length} pass`)
  if (rework) parts.push(`${rework} fail`)
  if (secondLook) parts.push(`${secondLook} second look`)
  if (withDerek.length) parts.push(`${withDerek.length} with Derek`)
  if (completed.length) parts.push(`${completed.length} decided`)
  return (
    <p
      className="rounded-xl border border-line bg-panel px-4 py-3 text-base font-medium text-ink"
      data-testid="quick-count"
    >
      <span className="font-bold">{toDecide} to decide</span>
      {parts.length > 0 ? <span className="text-muted"> · {parts.join(' · ')}</span> : null}
    </p>
  )
}

function CompactActions({ sample, onAccept, onRework, onEngineer }) {
  const suggested = sample.suggestion.kind
  const base =
    'relative flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold leading-snug'

  const emphasize = (kind) => (suggested === kind ? 'ring-2 ring-offset-1 ' : '')

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      role="group"
      aria-label={`Decision for sample #${sample.id}`}
      data-sample-actions={sample.id}
    >
      <button
        type="button"
        data-action="accept"
        aria-label={`Accept sample #${sample.id}`}
        onClick={() => onAccept(sample.id)}
        className={`${base} ${emphasize('accept')} ${
          suggested === 'accept'
            ? 'border-2 border-pass bg-pass-bg text-pass ring-pass'
            : 'border-2 border-pass text-pass hover:bg-pass-bg'
        }`}
      >
        Accept
      </button>
      <button
        type="button"
        data-action="rework"
        aria-label={`Send sample #${sample.id} for rework`}
        onClick={() => onRework(sample.id)}
        className={`${base} ${emphasize('rework')} ${
          suggested === 'rework'
            ? 'border-2 border-hold bg-hold-bg text-hold ring-hold'
            : 'border-2 border-hold text-hold hover:bg-hold-bg'
        }`}
      >
        Send for rework
      </button>
      <button
        type="button"
        data-action="engineer"
        aria-label={`Send sample #${sample.id} to engineer`}
        onClick={() => onEngineer(sample.id)}
        className={`${base} focus-target col-span-2 sm:col-span-1 ${emphasize('engineer')} ${
          suggested === 'engineer'
            ? 'border-2 border-engineer bg-engineer-bg text-engineer ring-engineer'
            : 'border-2 border-engineer text-engineer hover:bg-engineer-bg'
        }`}
      >
        Send to engineer
      </button>
    </div>
  )
}

function NeedsRow({ sample, onAccept, onRework, onEngineer }) {
  const meta = SUGGESTION_META[sample.suggestion.kind]
  return (
    <li
      className="rounded-xl border border-line bg-panel p-3.5 shadow-sm"
      data-sample-card={sample.id}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-xl font-bold tabular-nums text-ink">#{sample.id}</h3>
        <p className={`text-sm font-semibold ${meta.className}`}>{meta.label}</p>
      </div>
      {sample.suggestion.reason ? (
        <p className="mt-1 text-sm text-muted">{sample.suggestion.reason}</p>
      ) : null}
      <div className="mt-3">
        <CompactActions
          sample={sample}
          onAccept={onAccept}
          onRework={onRework}
          onEngineer={onEngineer}
        />
      </div>
    </li>
  )
}

export default function MayaQuickView({
  samples,
  cases,
  onAccept,
  onRework,
  onAcceptSuggested,
  onRequestEscalate,
  onReopen,
}) {
  const { ready, needs, withDerek, completed } = partitionForQuick(samples, cases)

  return (
    <div className="space-y-4" data-testid="maya-quick-view">
      <CountLine
        ready={ready}
        needs={needs}
        withDerek={withDerek}
        completed={completed}
      />

      <section aria-labelledby="ready-heading" data-testid="ready-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="ready-heading" className="text-lg font-bold text-ink">
            Ready to accept ({ready.length})
          </h2>
          {ready.length > 0 ? (
            <button
              type="button"
              data-testid="accept-suggested-passes"
              onClick={onAcceptSuggested}
              className="min-h-12 rounded-lg bg-pass px-4 text-sm font-semibold text-white hover:bg-green-800"
            >
              {ready.length === 1
                ? 'Accept 1 suggested pass'
                : `Accept ${ready.length} suggested passes`}
            </button>
          ) : null}
        </div>
        {ready.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No suggested passes waiting for a decision.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {ready.map(({ sample }) => (
              <li key={sample.id}>
                <span
                  className="inline-flex min-h-11 items-center rounded-lg border border-pass/40 bg-pass-bg px-3 text-sm font-semibold text-pass"
                  data-sample-card={sample.id}
                >
                  #{sample.id}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="needs-heading" data-testid="needs-section">
        <h2 id="needs-heading" className="text-lg font-bold text-ink">
          Needs your decision ({needs.length})
        </h2>
        {needs.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No rework or second-look samples left.</p>
        ) : (
          <ul className="sample-list mt-3 space-y-3">
            {needs.map(({ sample }) => (
              <NeedsRow
                key={sample.id}
                sample={sample}
                onAccept={onAccept}
                onRework={onRework}
                onEngineer={onRequestEscalate}
              />
            ))}
          </ul>
        )}
      </section>

      {withDerek.length > 0 ? (
        <section aria-labelledby="with-derek-heading" data-testid="with-derek-section">
          <h2 id="with-derek-heading" className="text-lg font-bold text-ink">
            With Derek ({withDerek.length})
          </h2>
          <p className="mt-1 text-sm text-muted">
            Still pending. The batch is complete only when Derek decides these.
          </p>
          <ul className="mt-3 space-y-2">
            {withDerek.map(({ sample, caseRecord }) => {
              const stateMeta = DECISION_META[caseRecord.state]
              return (
                <li
                  key={sample.id}
                  className="rounded-xl border border-engineer/30 bg-engineer-bg/40 px-3.5 py-3"
                  data-sample-card={sample.id}
                  data-sample-status={sample.id}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-lg font-bold tabular-nums text-ink">#{sample.id}</span>
                    <span className={`text-sm font-semibold ${stateMeta.className}`}>
                      {stateMeta.label} · {ACTOR_META[caseRecord.owner]?.short || 'Derek'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    System: {caseRecord.escalation?.systemFinding || sample.suggestion.reason}
                  </p>
                  <p className="text-sm text-muted">
                    Maya: {operatorReasonDisplay(caseRecord.escalation)}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {completed.length > 0 ? (
        <details className="rounded-xl border border-line bg-panel p-3.5" data-testid="completed-details">
          <summary className="cursor-pointer text-lg font-bold text-ink">
            Decisions made ({completed.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {completed.map(({ sample, caseRecord }) => {
              const disposition = caseRecord.disposition
              const isAccept = disposition?.kind === DECISION.accepted
              const canOpen = canReopen(caseRecord, ACTOR.maya)
              return (
                <li
                  key={sample.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2 first:border-t-0 first:pt-0"
                  data-sample-card={sample.id}
                >
                  <div>
                    <p className="text-base font-semibold tabular-nums text-ink">
                      #{sample.id}{' '}
                      <span className={isAccept ? 'text-pass' : 'text-hold'}>
                        {DECISION_META[disposition?.kind]?.label || 'Resolved'}
                      </span>
                    </p>
                    <p className="text-sm text-muted">
                      {disposition?.authorLabel || 'Unknown'} ·{' '}
                      {disposition?.reason || 'No reason recorded.'}
                    </p>
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
                </li>
              )
            })}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
