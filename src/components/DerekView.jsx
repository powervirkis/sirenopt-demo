import {
  BATCH,
  DECISION_META,
  LAB_COUPONS,
  PROPERTIES,
  PROPERTY_ORDER,
  RESULT_META_FOR_ENGINEER,
  SUGGESTION_META,
  formatValue,
  getDecision,
} from '../data'
import SpecBar, { ChartLegend } from './SpecBar'

function RescanRuler({ sample, propertyKey }) {
  const p = PROPERTIES[propertyKey]
  const ticks = sample.repeatTicks[propertyKey] || []
  const value = sample.values[propertyKey]
  const band = sample.bands[propertyKey]
  const status = sample.propertyStatus[propertyKey]
  const meta = RESULT_META_FOR_ENGINEER(status)

  if (!band || ticks.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-panel p-4">
        <h3 className="text-lg font-semibold text-ink">Repeatability</h3>
        <p className="mt-2 text-base text-muted">Lab reference pending — no repeatability ticks for this property.</p>
      </section>
    )
  }

  const { low, high } = band
  const viewMin = Math.min(p.viewMin, ...ticks, p.min) - 0.05 * (p.max - p.min)
  const viewMax = Math.max(p.viewMax, ...ticks, p.max) + 0.05 * (p.max - p.min)
  const toPct = (v) => ((v - viewMin) / (viewMax - viewMin)) * 100

  return (
    <section className="rounded-xl border border-line bg-panel p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-ink">Repeatability</h3>
      <p className="mt-2 text-base leading-relaxed text-muted">
        These ticks are successive plasma passes on the same coupon. Repeat scans assess measurement
        stability under the current setup. Under appropriate assumptions, controlled averaging of
        independent repeats can reduce random uncertainty; it does not by itself prove accuracy
        against a lab reference.
      </p>
      <div className="mt-4 rounded-lg bg-surface p-4">
        <div
          className="relative h-16 w-full"
          role="img"
          aria-label={sample.explanations[propertyKey].text}
        >
          <div
            className="absolute top-6 h-4 rounded-sm bg-emerald-100"
            style={{ left: `${toPct(p.min)}%`, width: `${toPct(p.max) - toPct(p.min)}%` }}
          />
          <div className="absolute top-2 bottom-2 w-0.5 bg-slate-800" style={{ left: `${toPct(p.min)}%` }} />
          <div className="absolute top-2 bottom-2 w-0.5 bg-slate-800" style={{ left: `${toPct(p.max)}%` }} />
          <div
            className={`absolute top-5 h-6 rounded-sm border border-current/30 ${meta.band}`}
            style={{
              left: `${toPct(low)}%`,
              width: `${Math.max(toPct(high) - toPct(low), 1)}%`,
            }}
          />
          {ticks.map((t, i) => (
            <div
              key={`${t}-${i}`}
              className="absolute top-3 flex flex-col items-center"
              style={{ left: `${toPct(t)}%`, transform: 'translateX(-50%)' }}
            >
              <div className={`h-10 w-0.5 ${meta.bar}`} />
              <div className={`h-2.5 w-2.5 rounded-full ${meta.bar}`} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-base text-ink">
          Point {formatValue(propertyKey, value)} {p.unit} · Range{' '}
          {formatValue(propertyKey, low, { range: true })}–
          {formatValue(propertyKey, high, { range: true })} {p.unit} · Spec{' '}
          {formatValue(propertyKey, p.min)}–{formatValue(propertyKey, p.max)} {p.unit}
        </p>
      </div>
    </section>
  )
}

function LabCouponScatter({ sample, propertyKey }) {
  const p = PROPERTIES[propertyKey]
  const lab = LAB_COUPONS[propertyKey]
  const value = sample.values[propertyKey]
  const points = lab.points
  const axisMin = Math.min(p.viewMin, ...points.flat())
  const axisMax = Math.max(p.viewMax, ...points.flat(), value)
  const pad = (axisMax - axisMin) * 0.05
  const min = axisMin - pad
  const max = axisMax + pad
  const size = 240
  const toX = (pred) => ((pred - min) / (max - min)) * size
  const toY = (labVal) => size - ((labVal - min) / (max - min)) * size
  const predX = toX(value)

  return (
    <section className="rounded-xl border border-line bg-panel p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-ink">Reference coverage</h3>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Filled points have both a plasma prediction and a {lab.labMethod} lab value. This sample has
        prediction only — shown as a vertical guide with a labeled marker outside the plot (no
        fabricated lab y-value).
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="overflow-x-auto">
          <svg
            width={size + 56}
            height={size + 56}
            viewBox={`-40 -28 ${size + 56} ${size + 56}`}
            className="max-w-full"
            role="img"
            aria-label={`Predicted versus lab scatter for ${p.label}. Sample #${sample.id} predicted ${formatValue(propertyKey, value)} ${p.unit}; lab reference pending.`}
          >
            <rect x={0} y={0} width={size} height={size} fill="#f8fafc" stroke="#334155" />
            <line
              x1={0}
              y1={size}
              x2={size}
              y2={0}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <rect
              x={((p.min - min) / (max - min)) * size}
              y={0}
              width={((p.max - p.min) / (max - min)) * size}
              height={size}
              fill="#dcfce7"
              opacity={0.45}
            />
            {points.map(([pred, labVal], i) => (
              <circle key={i} cx={toX(pred)} cy={toY(labVal)} r={4.5} fill="#0f172a" />
            ))}
            {/* Prediction-only: vertical guide + label above plot — not a fake lab point */}
            <line
              x1={predX}
              y1={0}
              x2={predX}
              y2={size}
              stroke="#b45309"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
            <polygon
              points={`${predX},-4 ${predX - 7},-16 ${predX + 7},-16`}
              fill="#b45309"
            />
            <text
              x={Math.min(Math.max(predX, 40), size - 40)}
              y={-18}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#92400e"
              className="chart-label"
            >
              Pred. {formatValue(propertyKey, value)} · lab pending
            </text>
            <text x={size / 2} y={size + 28} textAnchor="middle" fontSize="13" fill="#334155" className="chart-label">
              Plasma prediction ({p.unit})
            </text>
            <text
              x={-size / 2}
              y={-26}
              textAnchor="middle"
              fontSize="13"
              fill="#334155"
              transform="rotate(-90)"
              className="chart-label"
            >
              Lab {lab.labMethod} ({p.unit})
            </text>
          </svg>
        </div>
        <div className="rounded-lg bg-surface p-3">
          <p className="text-base font-semibold text-ink">Coupon counts</p>
          <ul className="mt-2 space-y-1.5">
            {lab.bins.map((bin) => (
              <li key={bin.range} className="flex justify-between text-base">
                <span className="text-muted">{bin.range}</span>
                <span className="font-semibold tabular-nums text-ink">{bin.count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-medium text-look">{lab.sparseNote}</p>
        </div>
      </div>
    </section>
  )
}

export default function DerekView({
  samples,
  selectedId,
  onSelect,
  decisions,
  largeText,
  highContrast,
  onToggleLargeText,
  onToggleHighContrast,
}) {
  const sample = samples.find((s) => s.id === selectedId) || samples[0]
  const decision = getDecision(decisions, sample.id)
  const driveKey = sample.suggestion.propertyKey || 'porosity'
  const sug = SUGGESTION_META[sample.suggestion.kind]

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 pb-16 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            PlasmaSmart™ · Derek
          </p>
          <h1 className="text-2xl font-bold text-ink">Engineering evidence</h1>
          <p className="mt-1 text-base text-muted">
            Batch {BATCH.id} · {BATCH.product}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Display">
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

      <div
        className="sticky top-14 z-10 -mx-4 flex flex-wrap gap-2 border-b border-line bg-surface px-4 py-2 sm:-mx-6 sm:px-6"
        role="listbox"
        aria-label="Select sample"
      >
        {samples.map((s) => {
          const selected = s.id === sample.id
          return (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(s.id)}
              className={`min-h-11 rounded-lg px-3 text-sm font-semibold tabular-nums ${
                selected
                  ? 'bg-ink text-white'
                  : 'border border-line text-ink hover:bg-surface'
              }`}
            >
              #{s.id}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-line bg-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tabular-nums text-ink">#{sample.id}</h2>
            <p className="mt-2 text-base text-ink">
              <span className={`font-semibold ${sug.className}`}>
                <span aria-hidden="true">{sug.symbol} </span>
                {sug.label}
              </span>
              {sample.suggestion.reason ? (
                <span className="text-muted"> — {sample.suggestion.reason}</span>
              ) : null}
            </p>
          </div>
          <p className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink">
            Maya: {DECISION_META[decision].label}
          </p>
        </div>
        {sample.secondary?.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            {sample.secondary.map((s) => (
              <li key={s.reason}>{s.reason}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-line bg-panel p-4 sm:p-5">
        <h3 className="mb-2 text-base font-semibold text-ink">All three properties</h3>
        <ChartLegend />
        <div className="mt-4 space-y-5">
          {PROPERTY_ORDER.map((key) => (
            <SpecBar
              key={`${sample.id}-${key}`}
              propertyKey={key}
              value={sample.values[key]}
              status={sample.propertyStatus[key]}
              band={sample.bands[key]}
              explanation={sample.explanations[key]}
              size="lg"
            />
          ))}
        </div>
      </div>

      <p className="text-base text-muted">
        Focusing on <strong className="text-ink">{PROPERTIES[driveKey].label}</strong> — drives the
        measurement suggestion for this sample.
      </p>

      <RescanRuler key={`r-${sample.id}-${driveKey}`} sample={sample} propertyKey={driveKey} />
      <LabCouponScatter key={`l-${sample.id}-${driveKey}`} sample={sample} propertyKey={driveKey} />
    </div>
  )
}
