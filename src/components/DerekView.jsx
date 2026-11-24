import { useEffect, useState } from 'react'
import {
  ACTOR,
  ACTOR_META,
  BATCH,
  DECISION,
  DECISION_META,
  LAB_COUPONS,
  PROPERTIES,
  PROPERTY_ORDER,
  RESULT_META_FOR_ENGINEER,
  systemFindingFor,
  canDerekResolve,
  canReopen,
  chartFocusCopy,
  formatValue,
  getCase,
  historyEntries,
  isCompletedState,
  listEscalations,
  operatorReasonDisplay,
  queueReasonPreview,
  systemPromptedProperty,
  waitingLabel,
} from '../data'
import AccessibilityMenu from './AccessibilityMenu'
import SpecBar, { ChartLegend } from './SpecBar'

function RescanRuler({ sample, propertyKey }) {
  const p = PROPERTIES[propertyKey]
  const ticks = sample.repeatTicks[propertyKey] || []
  const value = sample.values[propertyKey]
  const band = sample.bands[propertyKey]
  const status = sample.propertyStatus[propertyKey]
  const meta = RESULT_META_FOR_ENGINEER(status)

  if (!band || ticks.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-panel p-4">
        <h3 className="text-lg font-semibold text-ink">Repeatability</h3>
        <p className="mt-2 text-base text-muted">
          Lab reference pending — no repeatability ticks for this property.
        </p>
      </section>
    )
  }

  const { low, high } = band
  const viewMin = Math.min(p.viewMin, ...ticks, p.min) - 0.05 * (p.max - p.min)
  const viewMax = Math.max(p.viewMax, ...ticks, p.max) + 0.05 * (p.max - p.min)
  const toPct = (v) => ((v - viewMin) / (viewMax - viewMin)) * 100
  const aboveLimit = ticks.filter((t) => t > p.max).length
  const inSpec = ticks.filter((t) => t >= p.min && t <= p.max).length

  return (
    <section className="rounded-xl border border-line bg-panel p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-ink">
        Measurement repeatability under the current setup
      </h3>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Each tick is one plasma pass on the same coupon under a fixed setup. The circle is the
        reported point. Repeat scans assess measurement stability; they do not by themselves prove
        accuracy against a laboratory reference.
      </p>
      <div className="mt-4 rounded-lg bg-surface p-4">
        <div
          className="relative h-16 w-full"
          role="img"
          aria-label={sample.explanations[propertyKey].text}
        >
          <div
            className="absolute top-6 h-4 rounded-sm bg-emerald-100"
            style={{ left: `${toPct(p.min)}%`, width: `${toPct(p.max) - toPct(p.min)}%` }}
          />
          <div
            className="absolute top-4 bottom-4 w-0.5 bg-slate-800"
            style={{ left: `${toPct(p.min)}%` }}
          />
          <div
            className="absolute top-4 bottom-4 w-1 bg-slate-900"
            style={{ left: `${toPct(p.max)}%` }}
            title={`Upper limit ${formatValue(propertyKey, p.max)}`}
          />
          {ticks.map((tick, index) => (
            <div
              key={`${tick}-${index}`}
              className="absolute top-3 bottom-5 w-0.5 bg-ink/80"
              style={{ left: `${toPct(tick)}%` }}
            />
          ))}
          <div
            className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${meta.bar}`}
            style={{ left: `${toPct(value)}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-muted">
          | = one plasma pass · ○ reported value · thick mark = upper limit
        </p>
        <p className="mt-2 text-base text-ink">
          Point {formatValue(propertyKey, value)} {p.unit} · Spread{' '}
          {formatValue(propertyKey, low, { range: true })}–
          {formatValue(propertyKey, high, { range: true })} {p.unit} · Spec{' '}
          {formatValue(propertyKey, p.min)}–{formatValue(propertyKey, p.max)} {p.unit}
        </p>
        <p className="mt-1 text-base font-medium text-ink">
          {aboveLimit} of {ticks.length} passes above the {formatValue(propertyKey, p.max)} limit
          {inSpec ? ` · ${inSpec} in spec` : ''}.
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
  const toX = (pred) => ((pred - min) / (max - min)) * size
  const toY = (labVal) => size - ((labVal - min) / (max - min)) * size
  const predX = toX(value)

  return (
    <section className="rounded-xl border border-line bg-panel p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-ink">
        Reference support and calibration applicability
      </h3>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Filled points have both a plasma prediction and a {lab.labMethod} lab value. Limited
        reference coverage can indicate weak support for a prediction in that region; it does not
        establish a specific error or root cause. This sample has a plasma prediction only.
        Laboratory reference not yet available, and the original measurement is unchanged.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="overflow-x-auto">
          <svg
            width={size + 56}
            height={size + 56}
            viewBox={`-40 -28 ${size + 56} ${size + 56}`}
            className="max-w-full"
            role="img"
            aria-label={`Predicted versus lab scatter for ${p.label}. Sample #${sample.id} predicted ${formatValue(propertyKey, value)} ${p.unit}; lab reference pending.`}
          >
            <rect x={0} y={0} width={size} height={size} fill="#f8fafc" stroke="#334155" />
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
            {points.map(([pred, labVal], i) => (
              <circle key={i} cx={toX(pred)} cy={toY(labVal)} r={4.5} fill="#0f172a" />
            ))}
            <line
              x1={predX}
              y1={0}
              x2={predX}
              y2={size}
              stroke="#b45309"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
            <polygon
              points={`${predX},-4 ${predX - 7},-16 ${predX + 7},-16`}
              fill="#b45309"
            />
            <text
              x={Math.min(Math.max(predX, 40), size - 40)}
              y={-18}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#92400e"
              className="chart-label"
            >
              Pred. {formatValue(propertyKey, value)} · lab pending
            </text>
            <text
              x={size / 2}
              y={size + 28}
              textAnchor="middle"
              fontSize="13"
              fill="#334155"
              className="chart-label"
            >
              Plasma prediction ({p.unit})
            </text>
            <text
              x={-size / 2}
              y={-26}
              textAnchor="middle"
              fontSize="13"
              fill="#334155"
              transform="rotate(-90)"
              className="chart-label"
            >
              Lab {lab.labMethod} ({p.unit})
            </text>
          </svg>
        </div>
        <div className="rounded-lg bg-surface p-3">
          <p className="text-base font-semibold text-ink">Coupon counts</p>
          <ul className="mt-2 space-y-1.5">
            {lab.bins.map((bin) => (
              <li key={bin.range} className="flex justify-between text-base">
                <span className="text-muted">{bin.range}</span>
                <span className="font-semibold tabular-nums text-ink">{bin.count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-medium text-look">{lab.sparseNote}</p>
          {lab.shownOfTotal ? (
            <p className="mt-2 text-xs text-muted">Scatter shows {lab.shownOfTotal} coupons.</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ResolvePanel({ sample, caseRecord, onResolve, onRequestVerification, onRecordEvidence }) {
  const [mode, setMode] = useState(null)
  const [reason, setReason] = useState('')
  const [what, setWhat] = useState('')
  const [method, setMethod] = useState('')
  const [responsible, setResponsible] = useState('')
  const [source, setSource] = useState('')
  const [findings, setFindings] = useState('')
  const [notes, setNotes] = useState('')

  if (caseRecord.state === DECISION.verification) {
    return (
      <section className="rounded-xl border border-look/40 bg-look-bg/40 p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-ink">What happens next</h3>
        <p className="mt-2 text-sm text-muted">
          Awaiting verification from {caseRecord.verification?.responsible}:{' '}
          {caseRecord.verification?.what} ({caseRecord.verification?.method}).
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            onRecordEvidence(sample.id, { source, findings, notes })
            setSource('')
            setFindings('')
            setNotes('')
          }}
        >
          <p className="text-sm font-semibold text-ink">Record returned evidence</p>
          <label className="block text-sm">
            Source / method
            <input
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Findings
            <textarea
              required
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border-2 border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Notes (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border-2 border-line px-3 py-2"
            />
          </label>
          <p className="text-xs text-muted">
            Note-only evidence preserves existing measurements and intervals. It does not create a
            final disposition.
          </p>
          <button
            type="submit"
            className="min-h-12 rounded-lg bg-engineer px-4 text-sm font-semibold text-white"
          >
            Record evidence · return to Awaiting engineer
          </button>
        </form>
      </section>
    )
  }

  if (!canDerekResolve(caseRecord) || caseRecord.state !== DECISION.engineer) {
    return null
  }

  return (
    <section className="rounded-xl border border-line bg-panel p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-ink">What happens next</h3>
      <p className="mt-1 text-sm text-muted">Sample #{sample.id} · Derek owns resolution.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('accept')}
          className={`min-h-12 rounded-lg px-4 text-sm font-semibold ${
            mode === 'accept'
              ? 'bg-pass text-white'
              : 'border-2 border-pass text-pass hover:bg-pass-bg'
          }`}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => setMode('rework')}
          className={`min-h-12 rounded-lg px-4 text-sm font-semibold ${
            mode === 'rework'
              ? 'bg-hold text-white'
              : 'border-2 border-hold text-hold hover:bg-hold-bg'
          }`}
        >
          Send for rework
        </button>
        <button
          type="button"
          onClick={() => setMode('verify')}
          className={`min-h-12 rounded-lg px-4 text-sm font-semibold ${
            mode === 'verify'
              ? 'bg-look text-white'
              : 'border-2 border-look text-look hover:bg-look-bg'
          }`}
        >
          Request verification
        </button>
      </div>

      {mode === 'accept' || mode === 'rework' ? (
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            onResolve(
              sample.id,
              mode === 'accept' ? DECISION.accepted : DECISION.rework,
              reason,
            )
            setReason('')
            setMode(null)
          }}
        >
          <label className="block text-sm font-semibold text-ink">
            Resolution explanation
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border-2 border-line px-3 py-2 font-normal"
              placeholder={
                mode === 'accept'
                  ? 'Why this sample can be accepted'
                  : 'Decisive issue for rework'
              }
            />
          </label>
          <button
            type="submit"
            className={`min-h-12 rounded-lg px-4 text-sm font-semibold text-white ${
              mode === 'accept' ? 'bg-pass' : 'bg-hold'
            }`}
          >
            Record {mode === 'accept' ? 'Accept' : 'Send for rework'}
          </button>
        </form>
      ) : null}

      {mode === 'verify' ? (
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            onRequestVerification(sample.id, { what, method, responsible })
            setWhat('')
            setMethod('')
            setResponsible('')
            setMode(null)
          }}
        >
          <label className="block text-sm font-semibold text-ink">
            What needs to be checked
            <input
              required
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-line px-3 py-2 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Verification method
            <input
              required
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-line px-3 py-2 font-normal"
              placeholder="e.g. repeat measurement, lab check"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Who provides it
            <input
              required
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-line px-3 py-2 font-normal"
            />
          </label>
          <button
            type="submit"
            className="min-h-12 rounded-lg bg-look px-4 text-sm font-semibold text-white"
          >
            Request verification
          </button>
        </form>
      ) : null}
    </section>
  )
}

function formatRecordedTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function CaseHistory({ caseRecord }) {
  const entries = historyEntries(caseRecord)
  if (entries.length === 0) return null
  return (
    <details className="rounded-xl border border-line bg-panel p-4 sm:p-5">
      <summary className="cursor-pointer text-lg font-semibold text-ink">Case history</summary>
      <ol className="mt-3 space-y-3">
        {entries.map((entry, index) => (
          <li key={`${entry.at || 'time'}-${entry.title}-${index}`} className="text-sm">
            <p className="font-semibold text-ink">
              {entry.title} · {entry.actorLabel}
            </p>
            {entry.detail ? <p className="mt-1 break-words text-ink">{entry.detail}</p> : null}
            {entry.at ? (
              <time className="mt-1 block text-xs text-muted" dateTime={entry.at}>
                {formatRecordedTime(entry.at)}
              </time>
            ) : null}
          </li>
        ))}
      </ol>
    </details>
  )
}

function CaseDetail({
  sample,
  caseRecord,
  onResolve,
  onRequestVerification,
  onRecordEvidence,
  onReopen,
}) {
  const focus = chartFocusCopy(sample)
  const driveKey = focus.propertyKey
  const operatorOnly = Boolean(caseRecord.escalation) && !systemPromptedProperty(sample)
  const stateMeta = DECISION_META[caseRecord.state]
  const openOwned = canDerekResolve(caseRecord)
  const completed = isCompletedState(caseRecord.state)

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tabular-nums text-ink">#{sample.id}</h2>
            <p className="mt-1 text-sm text-muted">
              Batch {BATCH.id} · {BATCH.product}
            </p>
          </div>
          <p className={`rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold ${stateMeta.className}`}>
            {stateMeta.label}
            {caseRecord.owner ? ` · ${ACTOR_META[caseRecord.owner].short}` : ''}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-line bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              System finding
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {caseRecord.escalation?.systemFinding || systemFindingFor(sample)}
            </p>
          </div>
          {caseRecord.escalation ? (
            <div
              className={`rounded-lg border p-3 ${
                operatorOnly
                  ? 'border-2 border-engineer bg-engineer-bg/50'
                  : 'border-line bg-surface'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Maya&apos;s reason
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {operatorReasonDisplay(caseRecord.escalation)}
              </p>
              {caseRecord.escalation.operatorNote ? (
                <p className="mt-1 break-words text-sm text-ink">
                  {caseRecord.escalation.operatorNote}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {caseRecord.verification?.returned ? (
          <div className="mt-3 rounded-lg border border-look/40 bg-look-bg/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Returned verification evidence
            </p>
            <p className="mt-1 text-sm text-ink">
              {caseRecord.verification.returned.source}:{' '}
              {caseRecord.verification.returned.findings}
            </p>
            {caseRecord.verification.returned.notes ? (
              <p className="mt-1 text-sm text-muted">{caseRecord.verification.returned.notes}</p>
            ) : null}
          </div>
        ) : null}

        {completed && caseRecord.disposition ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface p-3">
            <p className="text-sm text-ink">
              <span className="font-semibold">{DECISION_META[caseRecord.disposition.kind].label}</span>
              {' · '}
              {caseRecord.disposition.authorLabel}: {caseRecord.disposition.reason}
            </p>
            {canReopen(caseRecord, ACTOR.derek) ? (
              <button
                type="button"
                onClick={() => onReopen(sample.id)}
                className="min-h-11 text-sm font-medium text-engineer underline"
              >
                Reopen
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <CaseHistory caseRecord={caseRecord} />

      <section className="rounded-xl border border-line bg-panel p-4 sm:p-5">
        <h3 className="mb-2 text-lg font-semibold text-ink">What the measurements show</h3>
        <ChartLegend />
        <div className="mt-4 space-y-5">
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
      </section>

      <p className="text-base text-muted">
        {focus.prompted ? (
          <>
            Focusing on <strong className="text-ink">{focus.label}</strong> — property that
            prompted attention for this sample.
          </>
        ) : (
          <>
            Selected property: <strong className="text-ink">{focus.label}</strong>.
          </>
        )}
      </p>

      <RescanRuler key={`r-${sample.id}-${driveKey}`} sample={sample} propertyKey={driveKey} />
      <LabCouponScatter key={`l-${sample.id}-${driveKey}`} sample={sample} propertyKey={driveKey} />

      {openOwned ? (
        <ResolvePanel
          sample={sample}
          caseRecord={caseRecord}
          onResolve={onResolve}
          onRequestVerification={onRequestVerification}
          onRecordEvidence={onRecordEvidence}
        />
      ) : null}
    </div>
  )
}

export default function DerekView({
  samples,
  cases,
  selectedId,
  onSelect,
  tab,
  onTabChange,
  onResolve,
  onRequestVerification,
  onRecordEvidence,
  onReopen,
  statusMessage,
  largeText,
  highContrast,
  onToggleLargeText,
  onToggleHighContrast,
}) {
  const escalations = listEscalations(samples, cases)
  const openMatch = escalations.some((item) => item.sample.id === selectedId)
  const escalationFocusId = openMatch ? selectedId : (escalations[0]?.sample.id ?? null)
  const selected =
    tab === 'escalations'
      ? samples.find((sample) => sample.id === escalationFocusId) || null
      : samples.find((sample) => sample.id === selectedId) || null
  const caseRecord = selected ? getCase(cases, selected.id) : null

  useEffect(() => {
    if (tab !== 'escalations') return
    if (selectedId === escalationFocusId) return
    onSelect(escalationFocusId)
  }, [tab, selectedId, escalationFocusId, onSelect])

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 pb-16 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            PlasmaSmart™ · Derek
          </p>
          <h1 className="text-2xl font-bold text-ink">Engineering evidence</h1>
          <p className="mt-1 text-base text-muted">
            Batch {BATCH.id} · {BATCH.product}
          </p>
        </div>
        <AccessibilityMenu
          largeText={largeText}
          highContrast={highContrast}
          onToggleLargeText={onToggleLargeText}
          onToggleHighContrast={onToggleHighContrast}
        />
      </header>

      <div
        className="flex rounded-xl border-2 border-line bg-surface p-1"
        role="tablist"
        aria-label="Derek views"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'escalations'}
          onClick={() => {
            onTabChange('escalations')
            if (!escalations.some((e) => e.sample.id === selectedId)) {
              onSelect(escalations[0]?.sample.id ?? null)
            }
          }}
          className={`min-h-12 flex-1 rounded-lg px-3 text-sm font-semibold ${
            tab === 'escalations' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
          }`}
        >
          Escalations ({escalations.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          onClick={() => onTabChange('all')}
          className={`min-h-12 flex-1 rounded-lg px-3 text-sm font-semibold ${
            tab === 'all' ? 'bg-ink text-white' : 'text-muted hover:bg-panel'
          }`}
        >
          All analyses ({samples.length})
        </button>
      </div>

      {statusMessage ? (
        <p className="text-base text-muted" role="status">
          {statusMessage}
        </p>
      ) : null}

      {tab === 'escalations' ? (
        escalations.length === 0 ? (
          <div
            className="rounded-xl border border-line bg-panel p-6 text-center"
            data-testid="escalation-empty"
          >
            <p className="text-lg font-semibold text-ink">No open escalations</p>
            <p className="mt-2 text-sm text-muted">
              Resolved cases and other samples are available in All analyses.
            </p>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Escalation queue">
            {escalations.map(({ sample, caseRecord: item }) => {
              const active = selected?.id === sample.id
              const wait = waitingLabel(item)
              return (
                <li key={sample.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(sample.id)}
                    className={`w-full rounded-xl border-2 p-3 text-left ${
                      active
                        ? 'border-ink bg-ink text-white'
                        : item.state === DECISION.verification
                          ? 'border-look bg-look-bg text-ink'
                          : 'border-line bg-panel text-ink hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="shrink-0 text-lg font-bold tabular-nums">#{sample.id}</span>
                      <span className="min-w-0 text-right text-sm font-semibold">
                        {DECISION_META[item.state].label}
                        {wait ? ` · ${wait}` : ''}
                      </span>
                    </div>
                    <p className={`mt-1 break-words text-sm ${active ? 'text-white/85' : 'text-muted'}`}>
                      System: {item.escalation?.systemFinding || sample.suggestion.reason}
                    </p>
                    <p className={`break-words text-sm ${active ? 'text-white/85' : 'text-muted'}`}>
                      Maya: {queueReasonPreview(item.escalation)}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )
      ) : (
        <ul
          className="space-y-2"
          role="listbox"
          aria-label="All analyses"
          data-testid="all-analyses-list"
        >
          {samples.map((s) => {
            const item = getCase(cases, s.id)
            const selectedSample = s.id === selected?.id
            const pending =
              item.state === DECISION.engineer || item.state === DECISION.verification
            const stateMeta = DECISION_META[item.state]
            const statusLabel =
              item.owner === ACTOR.derek || item.disposition
                ? `${stateMeta.label} · ${
                    ACTOR_META[item.disposition?.author || item.owner]?.short || '—'
                  }`
                : stateMeta.label
            return (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedSample}
                  onClick={() => onSelect(s.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left ${
                    selectedSample
                      ? 'border-ink bg-ink text-white'
                      : pending
                        ? 'border-engineer bg-engineer-bg text-ink hover:bg-engineer-bg/80'
                        : 'border-line bg-panel text-ink hover:bg-surface'
                  }`}
                >
                  <span className="text-lg font-bold tabular-nums">#{s.id}</span>
                  <span
                    className={`text-sm font-semibold ${
                      selectedSample ? 'text-white/90' : stateMeta.className
                    }`}
                  >
                    {statusLabel}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {selected && caseRecord ? (
        <CaseDetail
          sample={selected}
          caseRecord={caseRecord}
          onResolve={onResolve}
          onRequestVerification={onRequestVerification}
          onRecordEvidence={onRecordEvidence}
          onReopen={onReopen}
        />
      ) : tab === 'all' ? (
        <p className="rounded-xl border border-line bg-panel p-4 text-sm text-muted">
          Select a sample to inspect. Opening a routine sample does not escalate it or change
          ownership.
        </p>
      ) : null}
    </div>
  )
}
