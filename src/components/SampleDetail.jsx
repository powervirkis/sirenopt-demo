import {
  BATCH,
  LAB_COUPONS,
  PROPERTIES,
  PROPERTY_ORDER,
  STATUS_META,
  bandFor,
  formatValue,
} from '../data'
import SpecBar from './SpecBar'

function RescanRuler({ sample, propertyKey }) {
  const p = PROPERTIES[propertyKey]
  const ticks = sample.repeatTicks[propertyKey]
  const value = sample.values[propertyKey]
  const { low, high } = bandFor(propertyKey, value)
  const status = sample.propertyStatus[propertyKey]
  const meta = STATUS_META[status === 'clear' ? 'pass' : status]

  const viewMin = Math.min(p.viewMin, ...ticks, p.min) - p.halfWidth * 0.2
  const viewMax = Math.max(p.viewMax, ...ticks, p.max) + p.halfWidth * 0.2
  const toPct = (v) => ((v - viewMin) / (viewMax - viewMin)) * 100

  const crossesHigh = high > p.max
  const crossesLow = low < p.min
  const fullyOut = high < p.min || low > p.max

  let headline
  if (fullyOut && value > p.max) {
    headline = `Every re-scan still sits above ${formatValue(propertyKey, p.max)} ${p.unit}.`
  } else if (fullyOut) {
    headline = `Every re-scan still sits below ${formatValue(propertyKey, p.min)} ${p.unit}.`
  } else if (crossesHigh) {
    const over = high - p.max
    headline = `One more plasma pass can land ${formatValue(propertyKey, over)} ${p.unit} past the ${formatValue(propertyKey, p.max)} limit.`
  } else if (crossesLow) {
    const under = p.min - low
    headline = `One more plasma pass can land ${formatValue(propertyKey, under)} ${p.unit} under the ${formatValue(propertyKey, p.min)} limit.`
  } else {
    headline = `Eight passes stay inside the ${formatValue(propertyKey, p.min)}–${formatValue(propertyKey, p.max)} ${p.unit} window.`
  }

  return (
    <section className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Uncertainty source 1 · Sensor / process noise
      </p>
      <h3 className="mt-1 text-lg font-semibold text-ink">Would a re-scan change this?</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Emission intensity drifts with gas flow and arc position between plasma passes. These eight
        ticks are successive passes on the same coupon — the same instrument, not a new lab test.
        More passes narrow this spread. They do not add lab proof.
      </p>

      <div className="mt-4 rounded-xl bg-surface p-4">
        <p className={`mb-3 text-sm font-semibold ${meta.chip.split(' ')[1]}`}>{headline}</p>
        <div className="relative h-16 w-full">
          {/* Spec window */}
          <div
            className="absolute top-6 h-4 rounded-sm bg-emerald-100"
            style={{
              left: `${toPct(p.min)}%`,
              width: `${toPct(p.max) - toPct(p.min)}%`,
            }}
          />
          {/* Limit lines */}
          <div
            className="absolute top-2 bottom-2 w-0.5 bg-slate-600"
            style={{ left: `${toPct(p.min)}%` }}
            title={`Lower limit ${formatValue(propertyKey, p.min)}`}
          />
          <div
            className="absolute top-2 bottom-2 w-0.5 bg-slate-600"
            style={{ left: `${toPct(p.max)}%` }}
            title={`Upper limit ${formatValue(propertyKey, p.max)}`}
          />
          {/* Band */}
          <div
            className={`absolute top-5 h-6 rounded-sm opacity-50 ${meta.band}`}
            style={{
              left: `${toPct(low)}%`,
              width: `${Math.max(toPct(high) - toPct(low), 1)}%`,
            }}
          />
          {/* Pass ticks */}
          {ticks.map((t, i) => (
            <div
              key={`${t}-${i}`}
              className="absolute top-3 flex flex-col items-center"
              style={{ left: `${toPct(t)}%`, transform: 'translateX(-50%)' }}
            >
              <div className={`h-10 w-0.5 ${meta.bar}`} />
              <div className={`h-2 w-2 rounded-full ${meta.bar}`} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
          <span>{formatValue(propertyKey, viewMin)}</span>
          <span>
            Limits {formatValue(propertyKey, p.min)} / {formatValue(propertyKey, p.max)} {p.unit}
          </span>
          <span>{formatValue(propertyKey, viewMax)}</span>
        </div>
        <p className="mt-3 text-xs text-muted">
          Point estimate {formatValue(propertyKey, value)} {p.unit} · Band{' '}
          {formatValue(propertyKey, low)}–{formatValue(propertyKey, high)} {p.unit} (±
          {formatValue(propertyKey, p.halfWidth)} from instrument repeatability)
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

  const predMark = toXY(value, value) // open mark on 1:1 — no lab value yet

  return (
    <section className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Uncertainty source 2 · Calibration coverage
      </p>
      <h3 className="mt-1 text-lg font-semibold text-ink">
        Do we have lab proof in this range?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Each filled point is a past coupon with both a plasma prediction and a {lab.labMethod} lab
        value. The open mark is this sample — predicted only. A {lab.labMethod} check is a
        different experiment from another plasma scan.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="overflow-x-auto">
          <svg
            width={size + 48}
            height={size + 40}
            viewBox={`-36 -8 ${size + 48} ${size + 40}`}
            className="max-w-full"
            role="img"
            aria-label={`Predicted versus lab scatter for ${p.label}`}
          >
            {/* Plot background */}
            <rect x={0} y={0} width={size} height={size} fill="#f8fafc" stroke="#cbd5e1" />
            {/* 1:1 line */}
            <line
              x1={0}
              y1={size}
              x2={size}
              y2={0}
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            {/* Spec band on predicted axis (vertical strip) */}
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
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={4.5}
                  fill="#0f172a"
                  opacity={0.75}
                />
              )
            })}
            {/* This prediction — open mark */}
            <circle
              cx={predMark.x}
              cy={predMark.y}
              r={8}
              fill="none"
              stroke="#b45309"
              strokeWidth={2.5}
            />
            <circle cx={predMark.x} cy={predMark.y} r={3} fill="#b45309" />
            {/* Axes labels */}
            <text x={size / 2} y={size + 28} textAnchor="middle" fontSize="11" fill="#475569">
              Plasma prediction ({p.unit})
            </text>
            <text
              x={-size / 2}
              y={-22}
              textAnchor="middle"
              fontSize="11"
              fill="#475569"
              transform={`rotate(-90)`}
            >
              Lab {lab.labMethod} ({p.unit})
            </text>
            <text x={0} y={size + 14} fontSize="10" fill="#64748b">
              {formatValue(propertyKey, min)}
            </text>
            <text x={size} y={size + 14} textAnchor="end" fontSize="10" fill="#64748b">
              {formatValue(propertyKey, max)}
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-surface p-3">
            <p className="text-sm font-semibold text-ink">Coupon counts near this prediction</p>
            <ul className="mt-2 space-y-1.5">
              {lab.bins.map((bin) => (
                <li key={bin.range} className="flex justify-between text-sm">
                  <span className="text-muted">{bin.range}</span>
                  <span className="font-semibold tabular-nums text-ink">{bin.count} coupons</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-medium text-look">{lab.sparseNote}</p>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            This sample predicts {formatValue(propertyKey, value)} {p.unit} (open mark on the 1:1
            line). Lab density near this prediction informs whether a re-scan is enough or a lab
            check is needed.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function SampleDetail({
  sample,
  disposition,
  onBack,
  onEscalate,
  onDerekSafe,
  onDerekRescan,
  onDerekLab,
}) {
  if (!sample) return null

  const meta = STATUS_META[sample.status]
  const driveKey = sample.drive.propertyKey || 'porosity'
  const driveProp = PROPERTIES[driveKey]

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
              ← Back to batch
            </button>
            <p className="text-xs text-muted">
              Engineer view · {BATCH.engineer}
            </p>
          </div>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="rounded-2xl border border-line border-l-4 bg-panel p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Sample detail
                </p>
                <h2 className="text-3xl font-bold tabular-nums text-ink">#{sample.id}</h2>
                <p className="mt-1 text-sm text-muted">
                  Batch {BATCH.id} · {BATCH.product}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-bold uppercase tracking-wide ${meta.chip}`}
              >
                {meta.word}
              </span>
            </div>
            <p className="mt-3 text-base font-medium text-ink">{sample.drive.phrase}</p>
            <p className="mt-1 text-sm text-muted">{sample.drive.detail}</p>
            {disposition && (
              <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm font-medium text-muted">
                Current disposition: {disposition}
              </p>
            )}
          </div>

          {/* Three property bars */}
          <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink">All three properties</h3>
            <div className="space-y-4">
              {PROPERTY_ORDER.map((key) => (
                <SpecBar
                  key={key}
                  propertyKey={key}
                  value={sample.values[key]}
                  status={sample.propertyStatus[key]}
                  size="lg"
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-panel/60 px-4 py-3 text-sm text-muted">
            Focusing on <strong className="text-ink">{driveProp.label}</strong> — the property that
            drives this sample’s status. Uncertainty is shown as re-scan spread and lab-coupon
            coverage, not a single score.
          </div>

          <RescanRuler sample={sample} propertyKey={driveKey} />
          <LabCouponScatter sample={sample} propertyKey={driveKey} />

          {/* Derek actions */}
          <section className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-semibold text-ink">Derek — disposition</h3>
            <p className="mt-1 text-sm text-muted">
              Choose one. Maya sees the result on the batch list.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => onDerekSafe(sample.id)}
                className="min-h-16 rounded-xl bg-pass px-3 text-sm font-semibold text-white hover:bg-green-800"
              >
                Safe to accept
              </button>
              <button
                type="button"
                onClick={() => onDerekRescan(sample.id)}
                className="min-h-16 rounded-xl border-2 border-look bg-look-bg px-3 text-sm font-semibold text-look hover:bg-amber-100"
              >
                Re-scan on the line
              </button>
              <button
                type="button"
                onClick={() => onDerekLab(sample.id)}
                className="min-h-16 rounded-xl border-2 border-ink bg-panel px-3 text-sm font-semibold text-ink hover:bg-surface"
              >
                Request a lab check
              </button>
            </div>
            {(sample.status === 'look' || sample.status === 'fail') && (
              <button
                type="button"
                onClick={() => onEscalate(sample)}
                className="mt-3 min-h-12 w-full rounded-xl border border-line text-sm font-medium text-muted hover:bg-surface"
              >
                Or re-send note to Derek from Maya’s queue
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
