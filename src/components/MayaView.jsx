import {
  BATCH,
  DECISION,
  DECISION_META,
  PROPERTIES,
  PROPERTY_ORDER,
  SUGGESTION_META,
  formatValue,
  getDecision,
  summarizeDecisions,
} from '../data'

function SuggestionBadge({ suggestion }) {
  const meta = SUGGESTION_META[suggestion.kind]
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-semibold ${meta.className}`}
        title={meta.label}
      >
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded border border-current text-sm font-bold"
          aria-hidden="true"
        >
          {meta.symbol}
        </span>
        <span className="sr-only">{meta.label}. </span>
        <span aria-hidden="true">{meta.label}</span>
      </span>
      {suggestion.reason ? (
        <span className="text-sm text-muted">{suggestion.reason}</span>
      ) : null}
    </div>
  )
}

function DecisionActions({ sample, decision, onAccept, onRework }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={`Decision for sample #${sample.id}`}>
      <button
        type="button"
        aria-pressed={decision === DECISION.accepted}
        onClick={() => onAccept(sample.id)}
        className={`min-h-11 min-w-[6.5rem] rounded-lg px-3 text-sm font-semibold ${
          decision === DECISION.accepted
            ? 'bg-pass text-white ring-2 ring-pass ring-offset-2'
            : 'border-2 border-pass text-pass hover:bg-pass-bg'
        }`}
      >
        Accept
      </button>
      <button
        type="button"
        aria-pressed={decision === DECISION.rework}
        onClick={() => onRework(sample.id)}
        className={`min-h-11 min-w-[7.5rem] rounded-lg px-3 text-sm font-semibold ${
          decision === DECISION.rework
            ? 'bg-hold text-white ring-2 ring-hold ring-offset-2'
            : 'border-2 border-hold text-hold hover:bg-hold-bg'
        }`}
      >
        Send for rework
      </button>
    </div>
  )
}

function PropertyCells({ sample }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-3">
      {PROPERTY_ORDER.map((key) => {
        const p = PROPERTIES[key]
        const band = sample.bands[key]
        return (
          <div key={key} className="text-sm">
            <div className="font-medium text-muted">{p.short}</div>
            <div className="tabular-nums font-semibold text-ink">
              {formatValue(key, sample.values[key])}{' '}
              <span className="font-normal text-muted">{p.unit}</span>
            </div>
            <div className="text-xs text-muted">
              Spec {formatValue(key, p.min)}–{formatValue(key, p.max)}
              {band
                ? ` · Range ${formatValue(key, band.low, { range: true })}–${formatValue(key, band.high, { range: true })}`
                : ' · Lab reference pending'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function MayaView({
  samples,
  decisions,
  onAccept,
  onRework,
  statusMessage,
  largeText,
  highContrast,
  onToggleLargeText,
  onToggleHighContrast,
}) {
  const counts = summarizeDecisions(samples, decisions)

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 pb-16 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            PlasmaSmart™ · Maya
          </p>
          <h1 className="text-2xl font-bold text-ink">Batch {BATCH.id}</h1>
          <p className="mt-1 text-base text-muted">
            {BATCH.line} · {BATCH.product} · {BATCH.shift}
          </p>
          <p className="mt-2 text-base font-medium text-ink">
            Every sample must be accepted or sent for rework before the line moves on.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Display"
        >
          <button
            type="button"
            aria-pressed={largeText}
            onClick={onToggleLargeText}
            className="min-h-11 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-surface"
          >
            Large text
          </button>
          <button
            type="button"
            aria-pressed={highContrast}
            onClick={onToggleHighContrast}
            className="min-h-11 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-surface"
          >
            High contrast
          </button>
        </div>
      </header>

      <p
        className="rounded-xl border border-line bg-panel px-4 py-3 text-base font-medium text-ink"
        aria-live="polite"
        data-testid="decision-progress"
      >
        {counts.complete
          ? `Batch review complete · ${counts.awaiting} awaiting decision · ${counts.accepted} accepted · ${counts.rework} sent for rework`
          : `${counts.awaiting} awaiting decision · ${counts.accepted} accepted · ${counts.rework} sent for rework`}
      </p>

      {statusMessage ? (
        <p className="text-base text-muted" role="status">
          {statusMessage}
        </p>
      ) : null}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Sample
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Measurements
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Suggestion
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Decision
              </th>
              <th scope="col" className="py-2 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {samples.map((sample) => {
              const decision = getDecision(decisions, sample.id)
              return (
                <tr key={sample.id} className="border-b border-line align-top">
                  <th scope="row" className="py-3 pr-3 text-lg font-bold tabular-nums text-ink">
                    #{sample.id}
                  </th>
                  <td className="py-3 pr-3">
                    <PropertyCells sample={sample} />
                  </td>
                  <td className="py-3 pr-3">
                    <SuggestionBadge suggestion={sample.suggestion} />
                  </td>
                  <td className="py-3 pr-3 text-sm font-semibold text-ink">
                    {DECISION_META[decision].label}
                  </td>
                  <td className="py-3">
                    <DecisionActions
                      sample={sample}
                      decision={decision}
                      onAccept={onAccept}
                      onRework={onRework}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Phone cards — stable order by sample id */}
      <ul className="space-y-3 md:hidden">
        {samples.map((sample) => {
          const decision = getDecision(decisions, sample.id)
          return (
            <li
              key={sample.id}
              className="rounded-xl border border-line bg-panel p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold tabular-nums text-ink">#{sample.id}</h2>
                <span className="text-sm font-semibold text-ink">
                  {DECISION_META[decision].label}
                </span>
              </div>
              <div className="mt-3">
                <PropertyCells sample={sample} />
              </div>
              <div className="mt-3">
                <SuggestionBadge suggestion={sample.suggestion} />
              </div>
              <div className="mt-4">
                <DecisionActions
                  sample={sample}
                  decision={decision}
                  onAccept={onAccept}
                  onRework={onRework}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
