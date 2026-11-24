import { DISPOSITION_META, RESULT_META, getDisposition } from '../data'

export function ResultChip({ result }) {
  const key = result === 'look' ? 'review' : result
  const meta = RESULT_META[key] || RESULT_META.pass
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${meta.chip}`}
    >
      <span aria-hidden="true">{meta.icon}</span>
      {meta.word}
    </span>
  )
}

export function DispositionChip({ disposition }) {
  const d = disposition || 'awaiting'
  const meta = DISPOSITION_META[d] || DISPOSITION_META.awaiting
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
      {meta.label}
    </span>
  )
}

export function SampleChips({ sample, dispositions }) {
  const result = sample.result || (sample.status === 'look' ? 'review' : sample.status)
  const disposition = getDisposition(dispositions, sample.id)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ResultChip result={result} />
      <DispositionChip disposition={disposition} />
    </div>
  )
}
