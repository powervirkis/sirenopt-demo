import { PROPERTIES, RESULT_META_FOR_ENGINEER, formatValue } from '../data'

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
  const meta = RESULT_META_FOR_ENGINEER(status)
  const tall = size === 'lg'
  const hasBand = band != null

  const left = toPct(p.min, p.viewMin, p.viewMax)
  const width = toPct(p.max, p.viewMin, p.viewMax) - left
  const tick = toPct(value, p.viewMin, p.viewMax)
  const bandLeft = hasBand ? toPct(Math.max(band.low, p.viewMin), p.viewMin, p.viewMax) : 0
  const bandWidth = hasBand
    ? toPct(Math.min(band.high, p.viewMax), p.viewMin, p.viewMax) - bandLeft
    : 0

  const aria = explanation?.text
    ? explanation.text
    : `${p.label} ${formatValue(propertyKey, value)} ${p.unit}`

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
        className={`relative w-full rounded-sm bg-slate-200 high-contrast:bg-slate-300 ${tall ? 'h-6' : 'h-4'}`}
        role="img"
        aria-label={aria}
      >
        <div
          className="absolute inset-y-0 rounded-sm bg-emerald-100"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <div className="absolute inset-y-0 w-0.5 bg-slate-800" style={{ left: `${left}%` }} />
        <div
          className="absolute inset-y-0 w-0.5 bg-slate-800"
          style={{ left: `${left + width}%` }}
        />
        {hasBand && (
          <div
            className={`absolute top-0.5 bottom-0.5 rounded-sm border border-current/40 ${meta.band}`}
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
          <div className="flex justify-between text-sm tabular-nums text-muted">
            <span>{formatValue(propertyKey, p.viewMin, { range: true })}</span>
            <span>
              Spec {formatValue(propertyKey, p.min)}–{formatValue(propertyKey, p.max)} {p.unit}
            </span>
            <span>{formatValue(propertyKey, p.viewMax, { range: true })}</span>
          </div>
          <p className="text-base text-ink">
            {hasBand ? (
              <>
                Range {formatValue(propertyKey, band.low, { range: true })}–
                {formatValue(propertyKey, band.high, { range: true })} {p.unit}
                {' · '}
                <span className="font-semibold">{meta.word}</span>
                {explanation?.reason ? ` — ${explanation.reason}` : null}
              </>
            ) : (
              <>Lab reference pending · <span className="font-semibold">Boundary</span></>
            )}
          </p>
        </>
      )}
    </div>
  )
}

export function ChartLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-5 rounded-sm border border-slate-500 bg-emerald-100" />
        Spec region
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full border-2 border-white bg-ink shadow-sm" />
        Prediction
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-5 rounded-sm border border-look bg-look-band/80" />
        Uncertainty range
      </li>
    </ul>
  )
}
