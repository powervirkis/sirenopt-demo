import { PROPERTY_ORDER, PROPERTIES, formatValue, packageForDerek } from '../data'

export default function EscalateSheet({ sample, onCancel, onSend }) {
  if (!sample) return null

  const pkg = packageForDerek(sample)

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        className="fade-in w-full max-w-md rounded-xl bg-panel p-5 shadow-xl"
        role="dialog"
        aria-labelledby="escalate-title"
      >
        <h2 id="escalate-title" className="text-lg font-semibold text-ink">
          Send sample {sample.id} to Derek?
        </h2>
        <p className="mt-1 text-sm text-muted">
          Packages the sample id, three point estimates, three bands, and the spec limits. Does not
          open engineer charts.
        </p>

        <dl className="mt-4 space-y-2 rounded-lg border border-line bg-surface p-3 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Sample</dt>
            <dd className="font-semibold tabular-nums text-ink">#{pkg.sampleId}</dd>
          </div>
          {PROPERTY_ORDER.map((key) => {
            const p = PROPERTIES[key]
            const band = pkg.bands[key]
            return (
              <div key={key} className="border-t border-line/70 pt-2">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">{p.short}</dt>
                  <dd className="tabular-nums font-semibold text-ink">
                    {formatValue(key, pkg.points[key])} {p.unit}
                  </dd>
                </div>
                <div className="mt-0.5 flex justify-between gap-2 text-xs text-muted">
                  <span>
                    Band {formatValue(key, band.low)}–{formatValue(key, band.high)}
                  </span>
                  <span>
                    Spec {formatValue(key, p.min)}–{formatValue(key, p.max)}
                  </span>
                </div>
              </div>
            )
          })}
        </dl>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-14 flex-1 rounded-xl border-2 border-line bg-panel text-base font-semibold text-ink hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSend(pkg)}
            className="min-h-14 flex-1 rounded-xl bg-look text-base font-semibold text-white hover:bg-amber-700"
          >
            Send to Derek
          </button>
        </div>
      </div>
    </div>
  )
}
