import { PROPERTIES, STATUS_META, bandFor, formatValue } from '../data'

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
}) {
  const p = PROPERTIES[propertyKey]
  const { low, high } = band || bandFor(propertyKey, value)
  const meta = STATUS_META[status === 'clear' ? 'pass' : status]
  const tall = size === 'lg'

  const left = toPct(p.min, p.viewMin, p.viewMax)
  const width = toPct(p.max, p.viewMin, p.viewMax) - left
  const bandLeft = toPct(Math.max(low, p.viewMin), p.viewMin, p.viewMax)
  const bandWidth = toPct(Math.min(high, p.viewMax), p.viewMin, p.viewMax) - bandLeft
  const tick = toPct(value, p.viewMin, p.viewMax)

  return (
    <div className={tall ? 'space-y-1.5' : 'space-y-1'}>
      {showLabel && (
        <div className="flex items-baseline justify-between gap-2">
          <span className={`font-medium text-ink ${tall ? 'text-sm' : 'text-xs'}`}>
            {tall ? p.label : p.short}
          </span>
          <span className={`tabular-nums font-semibold text-ink ${tall ? 'text-base' : 'text-sm'}`}>
            {formatValue(propertyKey, value)}
            <span className="ml-1 text-xs font-normal text-muted">{p.unit}</span>
          </span>
        </div>
      )}
      <div
        className={`relative w-full rounded-sm bg-slate-200 ${tall ? 'h-5' : 'h-3.5'}`}
        role="img"
        aria-label={`${p.label} ${formatValue(propertyKey, value)} ${p.unit}, status ${meta.word}`}
      >
        <div
          className="absolute inset-y-0 rounded-sm bg-emerald-100"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-slate-500/60"
          style={{ left: `${left}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-slate-500/60"
          style={{ left: `${left + width}%` }}
        />
        <div
          className={`absolute top-0.5 bottom-0.5 rounded-sm ${meta.band}`}
          style={{ left: `${bandLeft}%`, width: `${Math.max(bandWidth, 1.5)}%` }}
        />
        <div
          className={`absolute top-0 bottom-0 w-0.5 ${meta.bar}`}
          style={{ left: `calc(${tick}% - 1px)` }}
        />
        <div
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${meta.bar}`}
          style={{ left: `${tick}%` }}
        />
      </div>
      {tall && (
        <div className="flex justify-between text-[10px] tabular-nums text-muted">
          <span>{formatValue(propertyKey, p.viewMin)}</span>
          <span>
            Spec {formatValue(propertyKey, p.min)}–{formatValue(propertyKey, p.max)}
          </span>
          <span>{formatValue(propertyKey, p.viewMax)}</span>
        </div>
      )}
    </div>
  )
}
