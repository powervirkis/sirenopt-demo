import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { systemFindingFor } from '../data'
import { useDialog } from '../hooks/useDialog'

/**
 * Required reason when Maya Accepts against a rework suggestion.
 * Cancel leaves the sample unchanged and returns focus to the trigger.
 */
export default function OverrideSheet({ sample, onConfirm, onCancel }) {
  const titleId = useId()
  const noteRef = useRef(null)
  const restoreFocusRef = useRef(true)
  const containerRef = useDialog({
    open: true,
    onClose: onCancel,
    initialFocusRef: noteRef,
    restoreFocusRef,
  })
  const [note, setNote] = useState('')
  const canSend = note.trim().length > 0
  const systemFinding = systemFindingFor(sample)

  const confirm = () => {
    if (!canSend) return
    restoreFocusRef.current = false
    onConfirm({ reason: note.trim() })
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
          Accept #{sample.id} against rework suggestion?
        </h2>
        <p className="mt-2 text-sm text-muted">
          The system suggested Send for rework. Record why you are accepting instead.
        </p>

        <div className="mt-4 rounded-xl border border-line bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            System finding
          </p>
          <p className="mt-1 text-sm font-medium text-ink">{systemFinding}</p>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink">Override reason (required)</span>
          <textarea
            ref={noteRef}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="focus-target mt-1 w-full rounded-lg border-2 border-line bg-panel px-3 py-2 text-sm text-ink"
            placeholder="Why this sample can be accepted"
          />
        </label>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            disabled={!canSend}
            onClick={confirm}
            className="focus-target min-h-12 flex-1 rounded-lg bg-pass px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Accept with override
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
