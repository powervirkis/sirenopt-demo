import { PROPERTIES, RESULT_META, formatValue } from '../data'

function toPct(value, viewMin, viewMax) {
  return ((value - viewMin) / (viewMax - viewMin)) * 100
}

export default function SpecBar({
  propertyKey,
  value,
  status,
  band,
  size = 'md',
  showLabel = true,
  explanation,
}) {
  const p = PROPERTIES[propertyKey]
  const low = band?.low
  const high = band?.high
  const resultKey = status === 'clear' ? 'pass' : status === 'look' ? 'review' : status
  const meta = RESULT_META[resultKey] || RESULT_META.pass
  const tall = size === 'lg'

  const left = toPct(p.min, p.viewMin, p.viewMax)
  const width = toPct(p.max, p.viewMin, p.viewMax) - left
  const tick = toPct(value, p.viewMin, p.viewMax)
  const hasBand = band != null
  const bandLeft = hasBand ? toPct(Math.max(low, p.viewMin), p.viewMin, p.viewMax) : 0
  const bandWidth = hasBand
    ? toPct(Math.min(high, p.viewMax), p.viewMin, p.viewMax) - bandLeft
    : 0

  const aria = explanation?.text
    ? explanation.text
    : `${p.label} ${formatValue(propertyKey, value)} ${p.unit}, ${meta.word}`

  return (
    <div className={tall ? 'space-y-1.5' : 'space-y-1'}>
      {showLabel && (
        <div className="flex items-baseline justify-between gap-2">
          <span className={`font-medium text-ink ${tall ? 'text-base' : 'text-sm'}`}>
            {tall ? p.label : p.short}
          </span>
          <span className={`tabular-nums font-semibold text-ink ${tall ? 'text-lg' : 'text-base'}`}>
            {formatValue(propertyKey, value)}
            <span className="ml-1 text-sm font-normal text-muted">{p.unit}</span>
          </span>
        </div>
      )}
      <div
        className={`relative w-full rounded-sm bg-slate-200 ${tall ? 'h-6' : 'h-4'}`}
        role="img"
        aria-label={aria}
      >
        <div
          className="absolute inset-y-0 rounded-sm bg-emerald-100"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <div className="absolute inset-y-0 w-0.5 bg-slate-700" style={{ left: `${left}%` }} />
        <div
          className="absolute inset-y-0 w-0.5 bg-slate-700"
          style={{ left: `${left + width}%` }}
        />
        {hasBand && (
          <div
            className={`absolute top-0.5 bottom-0.5 rounded-sm ${meta.band}`}
            style={{ left: `${bandLeft}%`, width: `${Math.max(bandWidth, 1.5)}%` }}
          />
        )}
        <div
          className={`absolute top-0 bottom-0 w-0.5 ${meta.bar}`}
          style={{ left: `calc(${tick}% - 1px)` }}
        />
        <div
          className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${meta.bar}`}
          style={{ left: `${tick}%` }}
        />
      </div>
      {tall && (
        <>
          <div className="flex justify-between text-xs tabular-nums text-muted">
            <span>{formatValue(propertyKey, p.viewMin)}</span>
            <span>
              Spec {formatValue(propertyKey, p.min)}–{formatValue(propertyKey, p.max)} {p.unit}
            </span>
            <span>{formatValue(propertyKey, p.viewMax)}</span>
          </div>
          <p className="text-sm text-ink">
            {hasBand ? (
              <>
                Range {formatValue(propertyKey, low)}–{formatValue(propertyKey, high)} {p.unit}
                {' · '}
                <span className="font-semibold">{meta.word}</span>
                {explanation ? ` — ${explanation.reason}` : null}
              </>
            ) : (
              <>
                Range unavailable · <span className="font-semibold">NEEDS REVIEW</span>
              </>
            )}
          </p>
        </>
      )}
    </div>
  )
}

export function ChartLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted sm:text-sm">
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-5 rounded-sm bg-emerald-100 border border-slate-400" />
        Spec region
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-ink border-2 border-white shadow-sm" />
        Prediction
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-5 rounded-sm bg-look-band/70" />
        Illustrative uncertainty range
      </li>
    </ul>
  )
}
