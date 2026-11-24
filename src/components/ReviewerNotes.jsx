import { REVIEWER_HIDES } from '../data'

export default function ReviewerNotes({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        className="fade-in w-full max-w-lg rounded-xl bg-panel p-5 shadow-xl"
        role="dialog"
        aria-labelledby="reviewer-title"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Reviewer note
            </p>
            <h2 id="reviewer-title" className="text-lg font-semibold text-ink">
              What this view hides
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-lg border border-line px-3 text-sm font-medium text-muted hover:bg-surface"
          >
            Close
          </button>
        </div>
        <p className="mb-4 text-sm text-muted">
          Same batch decisions. These cuts exist so Maya can finish in about two minutes without
          hunting — and without opening engineer charts.
        </p>
        <ul className="space-y-3">
          {REVIEWER_HIDES.map((item) => (
            <li key={item.removed} className="rounded-lg border border-line bg-surface p-3">
              <p className="text-sm font-semibold text-ink">Removed: {item.removed}</p>
              <p className="mt-1 text-sm text-muted">{item.why}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
