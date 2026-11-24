import { useRef } from 'react'
import {
  BATCH,
  DISPOSITION,
  ILLUSTRATIVE_DISCLOSURE,
  LAB_COUPONS,
  PROPERTIES,
  PROPERTY_ORDER,
  RESULT_META,
  formatValue,
  getDisposition,
} from '../data'
import { useDialog } from '../hooks/useDialog'
import SpecBar, { ChartLegend } from './SpecBar'
import { DispositionChip, ResultChip } from './StatusChip'

function RescanRuler({ sample, propertyKey }) {
  const p = PROPERTIES[propertyKey]
  const ticks = sample.repeatTicks[propertyKey] || []
  const value = sample.values[propertyKey]
  const band = sample.bands[propertyKey]
  const status = sample.propertyStatus[propertyKey]
  const meta = RESULT_META[status === 'clear' ? 'pass' : status === 'look' ? 'review' : status]

  if (!band || ticks.length === 0) {
    return (
      <section className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          Uncertainty source 1 · Instrument / setup repeatability (illustrative)
        </p>
        <h3 className="mt-1 text-lg font-semibold text-ink">Would a re-scan change this?</h3>
        <p className="mt-2 text-base text-muted">
          Illustrative repeatability ticks are missing for this property. Treat as NEEDS REVIEW —
          do not invent a range.
        </p>
      </section>
    )
  }

  const { low, high } = band
  const viewMin = Math.min(p.viewMin, ...ticks, p.min) - 0.05 * (p.max - p.min)
  const viewMax = Math.max(p.viewMax, ...ticks, p.max) + 0.05 * (p.max - p.min)
  const toPct = (v) => ((v - viewMin) / (viewMax - viewMin)) * 100

  const fullyOut = high < p.min || low > p.max
  let headline
  if (fullyOut && value > p.max) {
    headline = `Every illustrative re-scan still sits above ${formatValue(propertyKey, p.max)} ${p.unit}.`
  } else if (fullyOut) {
    headline = `Every illustrative re-scan still sits below ${formatValue(propertyKey, p.min)} ${p.unit}.`
  } else if (high > p.max) {
    headline = `Illustrative re-scan spread reaches past the ${formatValue(propertyKey, p.max)} ${p.unit} upper limit.`
  } else if (low < p.min) {
    headline = `Illustrative re-scan spread reaches below the ${formatValue(propertyKey, p.min)} ${p.unit} lower limit.`
  } else {
    headline = `Eight illustrative passes stay inside the ${formatValue(propertyKey, p.min)}–${formatValue(propertyKey, p.max)} ${p.unit} window.`
  }

  return (
    <section className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">
        Uncertainty source 1 · Instrument / setup repeatability (illustrative)
      </p>
      <h3 className="mt-1 text-lg font-semibold text-ink">Would a re-scan change this?</h3>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Example: emission intensity drifts with gas flow and arc position between plasma passes.
        These ticks are successive illustrative passes on the same coupon — the same instrument, not
        a new lab test. More passes may narrow this spread. Repeatability alone is not proof of
        accuracy against a lab reference.
      </p>
      <p className="mt-2 text-sm font-medium text-look">
        Recommended next check: another line re-scan if the question is instrument noise — not a
        substitute for lab verification.
      </p>

      <div className="mt-4 rounded-xl bg-surface p-4">
        <p className="mb-3 text-base font-semibold text-ink">{headline}</p>
        <div className="relative h-16 w-full" role="img" aria-label={sample.explanations[propertyKey].text}>
          <div
            className="absolute top-6 h-4 rounded-sm bg-emerald-100"
            style={{
              left: `${toPct(p.min)}%`,
              width: `${toPct(p.max) - toPct(p.min)}%`,
            }}
          />
          <div className="absolute top-2 bottom-2 w-0.5 bg-slate-700" style={{ left: `${toPct(p.min)}%` }} />
          <div className="absolute top-2 bottom-2 w-0.5 bg-slate-700" style={{ left: `${toPct(p.max)}%` }} />
          <div
            className={`absolute top-5 h-6 rounded-sm opacity-50 ${meta.band}`}
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
        <p className="mt-3 text-sm text-ink">
          Point {formatValue(propertyKey, value)} {p.unit} · Illustrative range{' '}
          {formatValue(propertyKey, low)}–{formatValue(propertyKey, high)} {p.unit} · Spec{' '}
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
  const toXY = (pred, labVal) => {
    const x = ((pred - min) / (max - min)) * size
    const y = size - ((labVal - min) / (max - min)) * size
    return { x, y }
  }
  const predMark = toXY(value, value)

  return (
    <section className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">
        Uncertainty source 2 · Limited comparable reference coverage (illustrative)
      </p>
      <h3 className="mt-1 text-lg font-semibold text-ink">Do we have lab proof in this range?</h3>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Each filled point is an illustrative past coupon with both a plasma prediction and a{' '}
        {lab.labMethod} lab value. The open mark is this sample — predicted only. A {lab.labMethod}{' '}
        check is a different experiment from another plasma scan.
      </p>
      <p className="mt-2 text-sm font-medium text-look">
        Recommended next check: request a lab {lab.labMethod} if reference density is thin near this
        prediction.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="overflow-x-auto">
          <svg
            width={size + 48}
            height={size + 40}
            viewBox={`-36 -8 ${size + 48} ${size + 40}`}
            className="max-w-full"
            role="img"
            aria-label={`Illustrative predicted versus lab scatter for ${p.label}. This sample predicted ${formatValue(propertyKey, value)} ${p.unit} with no lab value yet.`}
          >
            <rect x={0} y={0} width={size} height={size} fill="#f8fafc" stroke="#64748b" />
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
            {points.map(([pred, labVal], i) => {
              const { x, y } = toXY(pred, labVal)
              return <circle key={i} cx={x} cy={y} r={4.5} fill="#0f172a" opacity={0.75} />
            })}
            <circle cx={predMark.x} cy={predMark.y} r={8} fill="none" stroke="#b45309" strokeWidth={2.5} />
            <circle cx={predMark.x} cy={predMark.y} r={3} fill="#b45309" />
            <text x={size / 2} y={size + 28} textAnchor="middle" fontSize="12" fill="#334155">
              Plasma prediction ({p.unit})
            </text>
            <text
              x={-size / 2}
              y={-22}
              textAnchor="middle"
              fontSize="12"
              fill="#334155"
              transform="rotate(-90)"
            >
              Lab {lab.labMethod} ({p.unit})
            </text>
          </svg>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl bg-surface p-3">
            <p className="text-base font-semibold text-ink">Illustrative coupon counts</p>
            <ul className="mt-2 space-y-1.5">
              {lab.bins.map((bin) => (
                <li key={bin.range} className="flex justify-between text-base">
                  <span className="text-muted">{bin.range}</span>
                  <span className="font-semibold tabular-nums text-ink">{bin.count} coupons</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-medium text-look">{lab.sparseNote}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function SampleDetail({
  sample,
  dispositions,
  onBack,
  onRequestReview,
}) {
  if (!sample) return null

  const closeRef = useRef(null)
  const containerRef = useDialog({ open: true, onClose: onBack, initialFocusRef: closeRef })
  const result = sample.result || (sample.status === 'look' ? 'review' : sample.status)
  const meta = RESULT_META[result]
  const disposition = getDisposition(dispositions, sample.id)
  const driveKey = sample.drive.propertyKey || 'porosity'
  const driveProp = PROPERTIES[driveKey]

  return (
    <div
      key={sample.id}
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-surface"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`engineer-title-${sample.id}`}
    >
      <div className="slide-in mx-auto min-h-full max-w-3xl pb-10">
        <header className="sticky top-0 z-10 border-b border-line bg-panel/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              ref={closeRef}
              type="button"
              onClick={onBack}
              className="min-h-11 rounded-xl border-2 border-line px-4 text-base font-semibold text-ink hover:bg-surface"
              aria-label={`Close engineer detail for sample #${sample.id}`}
            >
              ← Back to batch
            </button>
            <p className="text-sm text-muted">Engineer view · {BATCH.engineer}</p>
          </div>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <p className="rounded-lg border border-look/30 bg-look-bg/50 px-3 py-2 text-sm text-ink">
            {ILLUSTRATIVE_DISCLOSURE}
          </p>

          <div className={`rounded-2xl border border-line border-l-4 bg-panel p-5 shadow-sm ${meta.row}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Engineer detail
                </p>
                <h2 id={`engineer-title-${sample.id}`} className="text-3xl font-bold tabular-nums text-ink">
                  #{sample.id}
                </h2>
                <p className="mt-1 text-base text-muted">
                  Batch {BATCH.id} · {BATCH.product}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ResultChip result={result} />
                <DispositionChip disposition={disposition} />
              </div>
            </div>
            <p className="mt-3 text-base font-medium text-ink">{sample.drive.phrase}</p>
            <p className="mt-1 text-base text-muted">{sample.drive.detail}</p>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
            <h3 className="mb-2 text-base font-semibold text-ink">All three properties</h3>
            <ChartLegend />
            <div className="mt-4 space-y-4">
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

          <div className="rounded-xl border border-dashed border-line bg-panel/60 px-4 py-3 text-base text-muted">
            Focusing on <strong className="text-ink">{driveProp.label}</strong> — the property that
            drives this sample’s result. Charts below are illustrative diagnostics keyed to sample #
            {sample.id}.
          </div>

          <RescanRuler sample={sample} propertyKey={driveKey} />
          <LabCouponScatter sample={sample} propertyKey={driveKey} />

          <section className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
            <h3 className="text-base font-semibold text-ink">Simulated handoff</h3>
            <p className="mt-1 text-base text-muted">
              This does not send email or open an external ticket. It only records a local demo
              disposition Maya can see on the batch list.
            </p>
            {disposition !== DISPOSITION.review_requested && result === 'review' ? (
              <button
                type="button"
                onClick={() => onRequestReview(sample.id)}
                className="mt-4 min-h-14 w-full rounded-xl bg-look text-base font-semibold text-white hover:bg-amber-700"
              >
                Record simulated review request
              </button>
            ) : (
              <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-base font-medium text-muted">
                Disposition: {disposition === DISPOSITION.review_requested ? 'Review requested (simulated)' : DISPOSITION_LABEL(disposition)}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function DISPOSITION_LABEL(d) {
  if (d === DISPOSITION.held) return 'Held'
  if (d === DISPOSITION.accepted) return 'Accepted'
  if (d === DISPOSITION.review_requested) return 'Review requested (simulated)'
  return 'Awaiting decision'
}
