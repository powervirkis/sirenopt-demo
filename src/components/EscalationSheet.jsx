import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ESCALATION_REASONS, systemFindingFor } from '../data'
import { useDialog } from '../hooks/useDialog'

/**
 * Compact reason-selection step before Send to engineer.
 * Cancel leaves the sample unchanged and returns focus to the trigger.
 */
export default function EscalationSheet({ sample, onConfirm, onCancel }) {
  const titleId = useId()
  const firstRef = useRef(null)
  const restoreFocusRef = useRef(true)
  const containerRef = useDialog({
    open: true,
    onClose: onCancel,
    initialFocusRef: firstRef,
    restoreFocusRef,
  })
  const [reasonId, setReasonId] = useState(
    sample.suggestion.kind === 'engineer' ? 'uncertain' : '',
  )
  const [note, setNote] = useState('')
  const reasonMeta = ESCALATION_REASONS.find((r) => r.id === reasonId)
  const needsNote = Boolean(reasonMeta?.requiresNote)
  const canSend = Boolean(reasonId) && (!needsNote || note.trim().length > 0)
  const systemFinding = systemFindingFor(sample)

  const confirm = () => {
    restoreFocusRef.current = false
    onConfirm({ reasonId, note })
  }

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-3 sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-line bg-panel p-4 shadow-xl sm:p-5"
      >
        <h2 id={titleId} className="text-xl font-bold text-ink">
          Send #{sample.id} to engineer
        </h2>
        <p className="mt-2 text-sm text-muted">
          Confirm why this sample needs engineering review. Cancel leaves it unchanged.
        </p>

        <div className="mt-4 rounded-xl border border-line bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            System finding
          </p>
          <p className="mt-1 text-sm font-medium text-ink">{systemFinding}</p>
        </div>

        <fieldset className="mt-4 space-y-2">
          <legend className="text-sm font-semibold text-ink">Maya&apos;s reason</legend>
          {ESCALATION_REASONS.map((reason, index) => (
            <label
              key={reason.id}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border-2 px-3 ${
                reasonId === reason.id
                  ? 'border-engineer bg-engineer-bg'
                  : 'border-line bg-panel hover:bg-surface'
              }`}
            >
              <input
                ref={index === 0 ? firstRef : undefined}
                type="radio"
                name={`escalate-reason-${sample.id}`}
                value={reason.id}
                checked={reasonId === reason.id}
                onChange={() => setReasonId(reason.id)}
                className="focus-target h-4 w-4 accent-[var(--color-engineer)]"
              />
              <span className="text-sm font-medium text-ink">{reason.label}</span>
            </label>
          ))}
        </fieldset>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink">
            Optional note{needsNote ? ' (required for Other)' : ''}
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="focus-target mt-1 w-full rounded-lg border-2 border-line bg-panel px-3 py-2 text-sm text-ink"
            placeholder="Short context for Derek"
          />
        </label>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            disabled={!canSend}
            onClick={confirm}
            className="focus-target min-h-12 flex-1 rounded-lg bg-engineer px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send to engineer
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="focus-target min-h-12 flex-1 rounded-lg border-2 border-line px-4 text-sm font-semibold text-ink hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
