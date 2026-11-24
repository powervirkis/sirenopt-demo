/** PlasmaSmart batch data and decision rules.
 *
 * Point estimates and specs come from the exercise.
 * Repeat-tick intervals in REPEAT_TICKS are illustrative demo inputs.
 *
 * Property interval (inclusive specs, unrounded values):
 * - entirely outside: range.max < spec.min || range.min > spec.max
 * - entirely inside:  range.min >= spec.min && range.max <= spec.max
 *
 * Sample suggestion (never auto-records a decision):
 * 1. any trustworthy interval entirely outside → rework
 * 2. else all three valid intervals entirely inside → accept
 * 3. else → engineer
 * Missing/invalid evidence blocks Accept; an outside interval still wins rework.
 *
 * Shared workflow case (one record per sample):
 * awaiting | engineer | verification | accepted | rework
 * Pending = awaiting + engineer + verification.
 * Batch complete only when every sample is accepted or rework.
 *
 * Ownership assumption (validate with SirenOpt): Maya owns routine decisions.
 * After she escalates, Derek owns resolution and may record the final disposition.
 */

export const BATCH = {
  line: 'Line 2',
  product: 'Cathode coating',
  id: 'B-1147',
  shift: 'Shift B',
  operator: 'Maya Chen',
  engineer: 'Derek Okonkwo',
}

export const PROPERTIES = {
  massLoading: {
    key: 'massLoading',
    label: 'Mass loading',
    short: 'Mass',
    unit: 'mg/cm²',
    min: 14.5,
    max: 15.5,
    decimals: 1,
    rangeDecimals: 2,
    viewMin: 14.0,
    viewMax: 16.2,
    showUnitOnMaya: false,
  },
  porosity: {
    key: 'porosity',
    label: 'Porosity',
    short: 'Porosity',
    unit: '%',
    min: 32,
    max: 36,
    decimals: 1,
    rangeDecimals: 1,
    viewMin: 30,
    viewMax: 38,
    showUnitOnMaya: true,
  },
  sheetResistance: {
    key: 'sheetResistance',
    label: 'Sheet resistance',
    short: 'Sheet R',
    unit: 'mΩ·cm²',
    min: 0.2,
    max: 0.35,
    decimals: 2,
    rangeDecimals: 2,
    viewMin: 0.15,
    viewMax: 0.48,
    showUnitOnMaya: false,
  },
}

export const PROPERTY_ORDER = ['massLoading', 'porosity', 'sheetResistance']

/** Illustrative re-scan ticks. Classification uses min–max. Documented for presenters. */
export const REPEAT_TICKS = {
  201: {
    massLoading: [15.02, 15.08, 15.1, 15.12, 15.15, 15.18, 15.05, 15.22],
    porosity: [35.2, 35.4, 35.5, 35.6, 35.7, 35.9, 36.0, 36.1],
    sheetResistance: [0.29, 0.3, 0.3, 0.31, 0.31, 0.32, 0.315, 0.305],
  },
  202: {
    massLoading: [14.82, 14.86, 14.9, 14.92, 14.95, 14.88, 14.91, 14.94],
    porosity: [32.9, 33.0, 33.1, 33.2, 33.3, 33.4, 33.15, 33.25],
    sheetResistance: [0.245, 0.25, 0.255, 0.26, 0.265, 0.258, 0.262, 0.252],
  },
  203: {
    massLoading: [15.5, 15.52, 15.55, 15.58, 15.6, 15.62, 15.65, 15.7],
    porosity: [33.7, 33.8, 33.9, 34.0, 34.1, 34.2, 34.05, 33.95],
    sheetResistance: [0.275, 0.28, 0.285, 0.29, 0.295, 0.288, 0.292, 0.282],
  },
  204: {
    massLoading: [14.92, 14.96, 15.0, 15.02, 15.05, 14.98, 15.01, 15.04],
    porosity: [36.1, 36.2, 36.3, 36.4, 36.5, 36.6, 36.7, 36.9],
    sheetResistance: [0.225, 0.23, 0.235, 0.24, 0.245, 0.238, 0.242, 0.232],
  },
  205: {
    // Low tick 14.48 crosses 14.5 — expose with rangeDecimals so Derek sees 14.48–14.65
    massLoading: [14.5, 14.52, 14.55, 14.58, 14.6, 14.62, 14.65, 14.48],
    porosity: [32.2, 32.3, 32.4, 32.5, 32.6, 32.7, 32.45, 32.55],
    sheetResistance: [0.385, 0.39, 0.4, 0.41, 0.415, 0.42, 0.405, 0.395],
  },
  206: {
    massLoading: [15.1, 15.15, 15.18, 15.2, 15.22, 15.25, 15.12, 15.28],
    porosity: [34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 34.75, 34.85],
    sheetResistance: [0.285, 0.29, 0.295, 0.3, 0.305, 0.298, 0.302, 0.292],
  },
}

export const LAB_COUPONS = {
  massLoading: {
    bins: [
      { range: '14.5–15.0', count: 38 },
      { range: '15.0–15.4', count: 42 },
      { range: '15.4–15.5', count: 9 },
      { range: '>15.5', count: 4 },
    ],
    sparseNote: 'Weigh-up coupons thin above 15.4 mg/cm². Lab reference pending for this sample.',
    points: [
      [14.6, 14.55],
      [14.7, 14.72],
      [14.8, 14.78],
      [14.9, 14.95],
      [15.0, 14.98],
      [15.1, 15.12],
      [15.2, 15.18],
      [15.3, 15.28],
      [15.35, 15.4],
      [15.4, 15.38],
      [15.45, 15.52],
      [15.5, 15.48],
      [15.55, 15.62],
      [15.6, 15.55],
      [15.65, 15.72],
    ],
    labMethod: 'weigh-up',
  },
  porosity: {
    bins: [
      { range: '33–35.5%', count: 51 },
      { range: '35.5–36%', count: 5 },
      { range: '>36%', count: 3 },
    ],
    sparseNote: 'Only 5 porosimetry coupons between 35.5–36%, 3 above 36%. Lab reference pending for this sample.',
    points: [
      [32.5, 32.4],
      [33.0, 33.1],
      [33.5, 33.4],
      [34.0, 34.2],
      [34.2, 34.0],
      [34.5, 34.6],
      [34.8, 34.7],
      [35.0, 35.1],
      [35.2, 35.0],
      [35.4, 35.5],
      [35.5, 35.6],
      [35.6, 35.4],
      [35.7, 35.9],
      [35.8, 35.7],
      [36.0, 36.2],
      [36.2, 36.0],
      [36.5, 36.3],
    ],
    labMethod: 'porosimetry',
  },
  sheetResistance: {
    bins: [
      { range: '0.20–0.30', count: 44 },
      { range: '0.30–0.35', count: 18 },
      { range: '>0.35', count: 6 },
    ],
    sparseNote: 'Four-point lab checks sparse above 0.35 mΩ·cm². Lab reference pending for this sample.',
    points: [
      [0.22, 0.21],
      [0.24, 0.245],
      [0.26, 0.255],
      [0.28, 0.29],
      [0.3, 0.295],
      [0.32, 0.33],
      [0.33, 0.325],
      [0.34, 0.35],
      [0.35, 0.34],
      [0.36, 0.38],
      [0.38, 0.37],
      [0.4, 0.42],
      [0.42, 0.41],
    ],
    labMethod: 'four-point probe',
  },
}

export const ACTOR = {
  maya: 'maya',
  derek: 'derek',
}

export const ACTOR_META = {
  maya: { label: 'Maya Chen', short: 'Maya' },
  derek: { label: 'Derek Okonkwo', short: 'Derek' },
}

/** Workflow states — keep measurement findings and recommendations separate. */
export const DECISION = {
  awaiting: 'awaiting',
  accepted: 'accepted',
  rework: 'rework',
  engineer: 'engineer',
  verification: 'verification',
}

export const DECISION_META = {
  awaiting: { label: 'Awaiting decision', short: 'Awaiting', className: 'text-ink' },
  accepted: { label: 'Accepted', short: 'Accepted', className: 'text-pass' },
  rework: { label: 'Sent for rework', short: 'Rework', className: 'text-hold' },
  engineer: { label: 'Awaiting engineer', short: 'Engineer', className: 'text-engineer' },
  verification: {
    label: 'Awaiting verification',
    short: 'Verification',
    className: 'text-look',
  },
}

export const ESCALATION_REASONS = [
  { id: 'uncertain', label: 'Uncertain result' },
  { id: 'mismatch', label: 'Does not match what I observe' },
  { id: 'unexpected', label: 'Unexpected for this batch' },
  { id: 'setup', label: 'Concern about sample or measurement setup' },
  { id: 'other', label: 'Other', requiresNote: true },
]

export const OPERATOR_REASON_MISSING = 'Operator reason not provided.'

export const SUGGESTION_META = {
  accept: {
    symbol: '✓',
    label: 'Accept suggested',
    action: 'accept',
    className: 'text-pass',
  },
  rework: {
    symbol: '↻',
    label: 'Send for rework suggested',
    action: 'rework',
    className: 'text-hold',
  },
  engineer: {
    symbol: '↗',
    label: 'Send to engineer suggested',
    action: 'engineer',
    className: 'text-engineer',
  },
}

/** Visual status icons for Maya (shape + text; not interactive). */
export const VISUAL_META = {
  ok: { symbol: '✓', label: '', className: 'text-pass', meaning: 'within limits' },
  near: { symbol: '!', label: 'Near limit', className: 'text-look', meaning: 'near limit' },
  high: {
    symbol: '↑',
    label: 'Above limit',
    className: 'text-hold',
    meaning: 'above limit',
  },
  low: {
    symbol: '↓',
    label: 'Below limit',
    className: 'text-hold',
    meaning: 'below limit',
  },
  unavailable: {
    symbol: '—',
    label: 'Unavailable',
    className: 'text-muted',
    meaning: 'unavailable',
  },
}

export function formatValue(propertyKey, value, { range = false } = {}) {
  const p = PROPERTIES[propertyKey]
  const decimals = range ? p.rangeDecimals : p.decimals
  return Number(value).toFixed(decimals)
}

export function bandFor(propertyKey, value, ticks) {
  if (ticks && ticks.length) {
    return { low: Math.min(...ticks), high: Math.max(...ticks) }
  }
  return null
}

/** Interval-only classification for suggestions and Derek evidence. */
export function classifyProperty(propertyKey, value, ticks) {
  const p = PROPERTIES[propertyKey]
  const band = bandFor(propertyKey, value, ticks)
  if (!band) return 'caution'
  const { low, high } = band
  if (high < p.min || low > p.max) return 'fail'
  if (low < p.min || high > p.max) return 'caution'
  return 'clear'
}

/**
 * Maya row icon status from point estimate + interval.
 * Above/Below limit follows the point estimate; amber Near limit is in-spec point
 * with interval past a boundary; green only when point and full interval are in.
 */
export function classifyVisual(propertyKey, value, ticks) {
  const p = PROPERTIES[propertyKey]
  const band = bandFor(propertyKey, value, ticks)
  if (!band || value == null || Number.isNaN(Number(value))) {
    return 'unavailable'
  }

  const pointOutHigh = value > p.max
  const pointOutLow = value < p.min
  if (pointOutHigh) return 'high'
  if (pointOutLow) return 'low'

  const intervalOverlaps = band.low < p.min || band.high > p.max
  if (intervalOverlaps) return 'near'
  return 'ok'
}

export function propertyExplanation(propertyKey, status, value, band) {
  const p = PROPERTIES[propertyKey]
  const point = formatValue(propertyKey, value)
  const spec = `${formatValue(propertyKey, p.min)}–${formatValue(propertyKey, p.max)} ${p.unit}`

  if (!band) {
    return {
      status: 'caution',
      reason: `${p.label} evidence missing.`,
      shortReason: `${p.label} unavailable.`,
      text: `Point ${point} ${p.unit}; range unavailable; spec ${spec}. Lab reference pending.`,
    }
  }

  const low = formatValue(propertyKey, band.low, { range: true })
  const high = formatValue(propertyKey, band.high, { range: true })
  const rangeText = `${low}–${high} ${p.unit}`

  if (status === 'fail') {
    if (band.low > p.max) {
      const limit = formatValue(propertyKey, p.max)
      const short =
        propertyKey === 'sheetResistance'
          ? `Sheet resistance exceeds ${limit} ${p.unit}.`
          : propertyKey === 'porosity'
            ? `Porosity exceeds ${limit}%.`
            : `Mass loading exceeds ${limit} ${p.unit}.`
      return {
        status: 'fail',
        reason: short,
        shortReason: `${p.label} above limit.`,
        text: `Point ${point} ${p.unit}; range ${rangeText}; spec ${spec}. Entire range above upper limit.`,
      }
    }
    const limit = formatValue(propertyKey, p.min)
    const short =
      propertyKey === 'porosity'
        ? `Porosity below ${limit}%.`
        : `Mass loading range below ${limit} ${p.unit}.`
    return {
      status: 'fail',
      reason: short,
      shortReason: `${p.label} below limit.`,
      text: `Point ${point} ${p.unit}; range ${rangeText}; spec ${spec}. Entire range below lower limit.`,
    }
  }

  if (status === 'caution') {
    if (band.high > p.max) {
      const limit = formatValue(propertyKey, p.max)
      const short =
        propertyKey === 'porosity'
          ? `Porosity range crosses ${limit}%.`
          : propertyKey === 'massLoading'
            ? `Mass loading range crosses ${limit} ${p.unit}.`
            : `Sheet resistance range crosses ${limit} ${p.unit}.`
      return {
        status: 'caution',
        reason: short,
        shortReason: `${p.label} near limit.`,
        text: `Point ${point} ${p.unit}; range ${rangeText}; spec ${spec}. Range overlaps upper limit.`,
      }
    }
    if (band.low < p.min) {
      const limit = formatValue(propertyKey, p.min)
      const short =
        propertyKey === 'massLoading'
          ? `Mass loading range crosses ${limit} ${p.unit}.`
          : `${p.label} range crosses ${limit} ${p.unit}.`
      return {
        status: 'caution',
        reason: short,
        shortReason: `${p.label} near limit.`,
        text: `Point ${point} ${p.unit}; range ${rangeText}; spec ${spec}. Range overlaps lower limit.`,
      }
    }
  }

  return {
    status: 'clear',
    reason: `${p.label} within spec.`,
    shortReason: '',
    text: `Point ${point} ${p.unit}; range ${rangeText}; spec ${spec}. Entirely within inclusive limits.`,
  }
}

function pickPriorityKey(statuses, target, preferOrder = PROPERTY_ORDER) {
  for (const key of preferOrder) {
    if (statuses[key] === target) return key
  }
  return PROPERTY_ORDER.find((k) => statuses[k] === target) || null
}

function buildSuggestion(propertyStatus, explanations, visualStatus) {
  const statuses = PROPERTY_ORDER.map((key) => propertyStatus[key])

  if (statuses.includes('fail')) {
    const key = pickPriorityKey(propertyStatus, 'fail', [
      'sheetResistance',
      'porosity',
      'massLoading',
    ])
    return {
      kind: 'rework',
      propertyKey: key,
      reason: explanations[key].shortReason,
    }
  }

  if (statuses.every((s) => s === 'clear')) {
    return { kind: 'accept', propertyKey: null, reason: '' }
  }

  // Missing evidence or boundary overlap → engineer. Prefer a near-limit cue.
  const nearKey = PROPERTY_ORDER.find((k) => visualStatus[k] === 'near')
  const highKey = PROPERTY_ORDER.find((k) => visualStatus[k] === 'high')
  const lowKey = PROPERTY_ORDER.find((k) => visualStatus[k] === 'low')
  const unavailableKey = PROPERTY_ORDER.find((k) => visualStatus[k] === 'unavailable')
  const key =
    nearKey ||
    highKey ||
    lowKey ||
    unavailableKey ||
    pickPriorityKey(propertyStatus, 'caution', ['porosity', 'massLoading', 'sheetResistance'])

  const visual = visualStatus[key]
  let reason = explanations[key]?.shortReason || ''
  if (visual === 'near') reason = `${PROPERTIES[key].label} near limit.`
  else if (visual === 'high') reason = `${PROPERTIES[key].label} above limit.`
  else if (visual === 'low') reason = `${PROPERTIES[key].label} below limit.`
  else if (visual === 'unavailable') reason = `${PROPERTIES[key].label} unavailable.`

  return {
    kind: 'engineer',
    propertyKey: key,
    reason,
  }
}

const RAW_SAMPLES = [
  { id: 201, values: { massLoading: 15.1, porosity: 35.6, sheetResistance: 0.31 } },
  { id: 202, values: { massLoading: 14.9, porosity: 33.2, sheetResistance: 0.26 } },
  { id: 203, values: { massLoading: 15.6, porosity: 34.0, sheetResistance: 0.29 } },
  { id: 204, values: { massLoading: 15.0, porosity: 36.4, sheetResistance: 0.24 } },
  { id: 205, values: { massLoading: 14.6, porosity: 32.5, sheetResistance: 0.41 } },
  { id: 206, values: { massLoading: 15.2, porosity: 34.8, sheetResistance: 0.3 } },
]

export function enrichSample(raw, ticksById = REPEAT_TICKS) {
  const ticks = ticksById[raw.id] || {}
  const propertyStatus = {}
  const visualStatus = {}
  const bands = {}
  const explanations = {}

  PROPERTY_ORDER.forEach((key) => {
    const t = ticks[key]
    bands[key] = bandFor(key, raw.values[key], t)
    propertyStatus[key] = classifyProperty(key, raw.values[key], t)
    visualStatus[key] = classifyVisual(key, raw.values[key], t)
    explanations[key] = propertyExplanation(
      key,
      propertyStatus[key],
      raw.values[key],
      bands[key],
    )
  })

  const suggestion = buildSuggestion(propertyStatus, explanations, visualStatus)
  const secondary = PROPERTY_ORDER.filter(
    (k) => k !== suggestion.propertyKey && propertyStatus[k] !== 'clear',
  ).map((k) => explanations[k])

  return {
    ...raw,
    repeatTicks: ticks,
    bands,
    propertyStatus,
    visualStatus,
    explanations,
    suggestion,
    secondary,
  }
}

export const SAMPLES = RAW_SAMPLES.map((r) => enrichSample(r))

function nowIso() {
  return new Date().toISOString()
}

function emptyCase(sampleId) {
  return {
    sampleId,
    state: DECISION.awaiting,
    owner: ACTOR.maya,
    escalation: null,
    verification: null,
    disposition: null,
    history: [],
  }
}

export function getCase(cases, id) {
  return cases[id] || emptyCase(id)
}

/** @deprecated Prefer getCase; kept for compatibility with older call sites. */
export function getDecision(cases, id) {
  return getCase(cases, id).state
}

export function isPendingState(state) {
  return (
    state === DECISION.awaiting ||
    state === DECISION.engineer ||
    state === DECISION.verification
  )
}

export function isCompletedState(state) {
  return state === DECISION.accepted || state === DECISION.rework
}

export function canMayaDecide(caseRecord) {
  return caseRecord.state === DECISION.awaiting && caseRecord.owner === ACTOR.maya
}

export function canDerekResolve(caseRecord) {
  return (
    caseRecord.owner === ACTOR.derek &&
    (caseRecord.state === DECISION.engineer || caseRecord.state === DECISION.verification)
  )
}

export function canReopen(caseRecord, actor) {
  return (
    isCompletedState(caseRecord.state) &&
    caseRecord.disposition?.author === actor
  )
}

function pushHistory(caseRecord, event) {
  return {
    ...caseRecord,
    history: [...caseRecord.history, { ...event, at: event.at || nowIso() }],
  }
}

function writeCase(cases, id, nextCase) {
  return { ...cases, [id]: nextCase }
}

/** Counts from shared cases — not suggestions. */
export function summarizeCases(samples, cases = {}) {
  let awaiting = 0
  let accepted = 0
  let rework = 0
  let engineer = 0
  let verification = 0
  samples.forEach((s) => {
    const state = getCase(cases, s.id).state
    if (state === DECISION.accepted) accepted += 1
    else if (state === DECISION.rework) rework += 1
    else if (state === DECISION.engineer) engineer += 1
    else if (state === DECISION.verification) verification += 1
    else awaiting += 1
  })
  const unresolved = awaiting + engineer + verification
  return {
    awaiting,
    accepted,
    rework,
    engineer,
    verification,
    unresolved,
    pending: unresolved,
    completed: accepted + rework,
    complete: unresolved === 0,
  }
}

/** @deprecated Prefer summarizeCases. */
export function summarizeDecisions(samples, cases = {}) {
  return summarizeCases(samples, cases)
}

export function systemFindingFor(sample) {
  if (sample.suggestion.reason) return sample.suggestion.reason
  if (sample.suggestion.kind === 'accept') return 'All three properties within inclusive limits.'
  return SUGGESTION_META[sample.suggestion.kind]?.label || 'System finding unavailable.'
}

export function buildEscalationSnapshot(sample, { reasonId, reasonLabel, note, at } = {}) {
  const bands = {}
  const specs = {}
  PROPERTY_ORDER.forEach((key) => {
    const p = PROPERTIES[key]
    const b = sample.bands[key]
    bands[key] = b ? { low: b.low, high: b.high } : null
    specs[key] = { min: p.min, max: p.max, unit: p.unit, label: p.label }
  })
  return {
    sampleId: sample.id,
    batchId: BATCH.id,
    values: { ...sample.values },
    bands,
    specs,
    recommendationKind: sample.suggestion.kind,
    systemFinding: systemFindingFor(sample),
    operatorReasonId: reasonId || null,
    operatorReason: reasonLabel || OPERATOR_REASON_MISSING,
    operatorNote: note?.trim() || '',
    actor: ACTOR.maya,
    actorLabel: ACTOR_META.maya.label,
    at: at || nowIso(),
  }
}

/**
 * Maya Accept / Send for rework while she owns the sample.
 * Rejected if the case is already escalated or owned by Derek.
 */
export function mayaDecide(cases, sampleId, disposition, { at } = {}) {
  if (disposition !== DECISION.accepted && disposition !== DECISION.rework) return cases
  const current = getCase(cases, sampleId)
  if (!canMayaDecide(current)) return cases
  if (current.state === disposition && current.disposition?.author === ACTOR.maya) {
    return cases
  }
  const stamped = at || nowIso()
  const next = pushHistory(
    {
      ...current,
      state: disposition,
      owner: ACTOR.maya,
      disposition: {
        kind: disposition,
        author: ACTOR.maya,
        authorLabel: ACTOR_META.maya.label,
        reason: disposition === DECISION.accepted ? 'Accepted by Maya.' : 'Sent for rework by Maya.',
        at: stamped,
      },
      verification: null,
    },
      {
        type: disposition === DECISION.accepted ? 'maya_accept' : 'maya_rework',
        actor: ACTOR.maya,
        at: stamped,
        reason:
          disposition === DECISION.accepted ? 'Accepted by Maya.' : 'Sent for rework by Maya.',
      },
  )
  return writeCase(cases, sampleId, next)
}

/**
 * Confirm escalation with a selected operator reason. Idempotent: does not
 * duplicate an existing open escalation case.
 */
export function confirmEscalation(cases, sample, { reasonId, note, at } = {}) {
  const current = getCase(cases, sample.id)
  if (current.state === DECISION.engineer && current.escalation) return cases
  if (current.state === DECISION.verification && current.escalation) return cases
  if (!canMayaDecide(current) && isCompletedState(current.state)) return cases
  if (!canMayaDecide(current) && current.owner === ACTOR.derek) return cases

  const reasonMeta = ESCALATION_REASONS.find((r) => r.id === reasonId)
  if (!reasonMeta) return cases
  if (reasonMeta.requiresNote && !note?.trim()) return cases

  const stamped = at || nowIso()
  const snapshot = buildEscalationSnapshot(sample, {
    reasonId,
    reasonLabel: reasonMeta.label,
    note,
    at: stamped,
  })
  const next = pushHistory(
    {
      ...current,
      state: DECISION.engineer,
      owner: ACTOR.derek,
      escalation: snapshot,
      disposition: null,
      verification: current.verification,
    },
    {
      type: 'escalated',
      actor: ACTOR.maya,
      reasonId,
      reason: reasonMeta.label,
      note: note?.trim() || '',
      at: stamped,
    },
  )
  return writeCase(cases, sample.id, next)
}

/** Derek Accept / Send for rework on an open case he owns. Requires explanation. */
export function derekResolve(cases, sampleId, disposition, { reason, at } = {}) {
  if (disposition !== DECISION.accepted && disposition !== DECISION.rework) return cases
  const explanation = reason?.trim()
  if (!explanation) return cases
  const current = getCase(cases, sampleId)
  if (current.owner !== ACTOR.derek) return cases
  if (current.state !== DECISION.engineer && current.state !== DECISION.verification) {
    return cases
  }
  const stamped = at || nowIso()
  const next = pushHistory(
    {
      ...current,
      state: disposition,
      owner: ACTOR.derek,
      disposition: {
        kind: disposition,
        author: ACTOR.derek,
        authorLabel: ACTOR_META.derek.label,
        reason: explanation,
        at: stamped,
      },
      verification: current.verification
        ? { ...current.verification, open: false }
        : null,
    },
    {
      type: disposition === DECISION.accepted ? 'derek_accept' : 'derek_rework',
      actor: ACTOR.derek,
      at: stamped,
      reason: explanation,
    },
  )
  return writeCase(cases, sampleId, next)
}

/** Request verification — stays pending; Derek retains ownership. */
export function requestVerification(
  cases,
  sampleId,
  { what, method, responsible, at } = {},
) {
  const current = getCase(cases, sampleId)
  if (current.owner !== ACTOR.derek || current.state !== DECISION.engineer) return cases
  if (!what?.trim() || !method?.trim() || !responsible?.trim()) return cases
  const stamped = at || nowIso()
  const request = {
    what: what.trim(),
    method: method.trim(),
    responsible: responsible.trim(),
    requestedAt: stamped,
    open: true,
    returned: null,
  }
  const next = pushHistory(
    {
      ...current,
      state: DECISION.verification,
      verification: request,
    },
    {
      type: 'verification_requested',
      actor: ACTOR.derek,
      at: stamped,
      what: request.what,
      method: request.method,
      responsible: request.responsible,
    },
  )
  return writeCase(cases, sampleId, next)
}

/**
 * Record returned verification evidence. Note-only leaves measurements alone.
 * Optional numericalResults are labeled and never replace the original prediction.
 */
export function recordVerificationEvidence(
  cases,
  sampleId,
  { source, findings, notes, numericalResults, at } = {},
) {
  const current = getCase(cases, sampleId)
  if (current.owner !== ACTOR.derek || current.state !== DECISION.verification) {
    return cases
  }
  if (!source?.trim() || !findings?.trim()) return cases
  const stamped = at || nowIso()
  const returned = {
    source: source.trim(),
    findings: findings.trim(),
    notes: notes?.trim() || '',
    numericalResults: numericalResults || null,
    at: stamped,
  }
  const next = pushHistory(
    {
      ...current,
      state: DECISION.engineer,
      verification: {
        ...current.verification,
        open: false,
        returned,
      },
    },
    {
      type: 'verification_returned',
      actor: ACTOR.derek,
      at: stamped,
      source: returned.source,
      findings: returned.findings,
      notes: returned.notes,
      numericalResults: returned.numericalResults,
    },
  )
  return writeCase(cases, sampleId, next)
}

/**
 * Reopen a completed disposition. Only the author may reopen.
 * Prior disposition remains in history; sample returns to the right pending owner.
 */
export function reopenCase(cases, sampleId, actor, { at } = {}) {
  const current = getCase(cases, sampleId)
  if (!canReopen(current, actor)) return cases
  const stamped = at || nowIso()
  const prior = current.disposition
  const returnsToEngineer = prior?.author === ACTOR.derek && current.escalation
  const next = pushHistory(
    {
      ...current,
      state: returnsToEngineer ? DECISION.engineer : DECISION.awaiting,
      owner: returnsToEngineer ? ACTOR.derek : ACTOR.maya,
      disposition: null,
      verification: returnsToEngineer ? current.verification : null,
    },
    {
      type: 'reopened',
      actor,
      at: stamped,
      priorDisposition: prior,
    },
  )
  return writeCase(cases, sampleId, next)
}

/** Open escalations Derek owns, action-needed first. */
export function listEscalations(samples, cases = {}) {
  const open = samples
    .map((s) => ({ sample: s, caseRecord: getCase(cases, s.id) }))
    .filter(
      ({ caseRecord }) =>
        caseRecord.owner === ACTOR.derek &&
        (caseRecord.state === DECISION.engineer ||
          caseRecord.state === DECISION.verification),
    )
  const actionNeeded = open.filter((x) => x.caseRecord.state === DECISION.engineer)
  const waiting = open.filter((x) => x.caseRecord.state === DECISION.verification)
  return [...actionNeeded, ...waiting]
}

export function operatorReasonDisplay(escalation) {
  if (!escalation?.operatorReason || escalation.operatorReason === OPERATOR_REASON_MISSING) {
    return OPERATOR_REASON_MISSING
  }
  return escalation.operatorReason
}

function clipText(text, max) {
  const clean = String(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).trimEnd()}…`
}

/** Queue line for Maya’s confirmed reason. Does not paraphrase the stored note. */
export function queueReasonPreview(escalation) {
  if (!escalation) return ''
  const note = escalation.operatorNote?.trim() || ''
  const label = escalation.operatorReason
  const missing = !label || label === OPERATOR_REASON_MISSING
  if (missing) return note ? clipText(note, 96) : OPERATOR_REASON_MISSING
  if (note && (escalation.operatorReasonId === 'other' || label === 'Other')) {
    return `Other: ${clipText(note, 96)}`
  }
  if (note) return `${label} — ${clipText(note, 72)}`
  return label
}

/** Property named by the system assessment. Null when measurements did not prompt one. */
export function systemPromptedProperty(sample) {
  return sample?.suggestion?.propertyKey || null
}

export function selectedChartProperty(sample) {
  return systemPromptedProperty(sample) || 'porosity'
}

export function chartFocusCopy(sample) {
  const key = selectedChartProperty(sample)
  const label = PROPERTIES[key]?.label || 'Porosity'
  if (systemPromptedProperty(sample)) {
    return {
      prompted: true,
      propertyKey: key,
      label,
      text: `Focusing on ${label} — property that prompted attention for this sample.`,
    }
  }
  return {
    prompted: false,
    propertyKey: key,
    label,
    text: `Selected property: ${label}.`,
  }
}

function historyActorLabel(actor) {
  return ACTOR_META[actor]?.label || 'Unknown'
}

/** Compact history rows from recorded events only. */
export function historyEntries(caseRecord) {
  if (!caseRecord?.history?.length) return []
  return caseRecord.history.map((event) => {
    const actorLabel = historyActorLabel(event.actor)
    const at = event.at || null
    switch (event.type) {
      case 'escalated': {
        const reason =
          event.reason ||
          ESCALATION_REASONS.find((item) => item.id === event.reasonId)?.label ||
          null
        const note = event.note || ''
        return {
          title: 'Escalated',
          actorLabel,
          detail: [reason, note].filter(Boolean).join(' — ') || null,
          at,
        }
      }
      case 'maya_accept':
      case 'derek_accept':
        return {
          title: 'Accepted',
          actorLabel,
          detail: event.reason || null,
          at,
        }
      case 'maya_rework':
      case 'derek_rework':
        return {
          title: 'Sent for rework',
          actorLabel,
          detail: event.reason || null,
          at,
        }
      case 'verification_requested':
        return {
          title: 'Verification requested',
          actorLabel,
          detail:
            [event.what, event.method, event.responsible].filter(Boolean).join(' · ') || null,
          at,
        }
      case 'verification_returned': {
        const parts = []
        if (event.source && event.findings) parts.push(`${event.source}: ${event.findings}`)
        else if (event.findings) parts.push(event.findings)
        if (event.notes) parts.push(event.notes)
        if ('numericalResults' in event && event.numericalResults == null) {
          parts.push('No new measurement numbers. Original measurements unchanged.')
        } else if (event.numericalResults) {
          parts.push('Labeled numbers recorded separately. Original prediction unchanged.')
        }
        return {
          title: 'Verification evidence recorded',
          actorLabel,
          detail: parts.join(' ') || null,
          at,
        }
      }
      case 'reopened': {
        const prior = event.priorDisposition
        const priorLabel = prior ? DECISION_META[prior.kind]?.label : null
        const detail = prior
          ? `Previous: ${priorLabel} by ${prior.authorLabel || 'Unknown'}${
              prior.reason ? ` — ${prior.reason}` : ''
            }`
          : null
        return { title: 'Reopened', actorLabel, detail, at }
      }
      default:
        return { title: 'Recorded event', actorLabel, detail: null, at }
    }
  })
}

export function waitingLabel(caseRecord) {
  if (!caseRecord.escalation?.at) return ''
  try {
    const start = new Date(caseRecord.escalation.at).getTime()
    const mins = Math.max(0, Math.round((Date.now() - start) / 60000))
    if (mins < 1) return 'Just now'
    if (mins === 1) return '1 min'
    if (mins < 60) return `${mins} min`
    const hrs = Math.round(mins / 60)
    return hrs === 1 ? '1 hr' : `${hrs} hr`
  } catch {
    return ''
  }
}

/** Legacy helpers used by older UI during migration — prefer mayaDecide. */
export function setDecision(cases, id, next) {
  if (next === DECISION.accepted || next === DECISION.rework) {
    return mayaDecide(cases, id, next)
  }
  return cases
}

export function clearDecision(cases, id) {
  return reopenCase(cases, id, getCase(cases, id).disposition?.author || ACTOR.maya)
}

export function recordEscalation(cases, sample) {
  return confirmEscalation(cases, sample, {
    reasonId: 'uncertain',
    note: '',
  })
}

export function RESULT_META_FOR_ENGINEER(status) {
  if (status === 'fail') {
    return {
      word: 'Outside spec',
      chip: 'bg-hold-bg text-hold border-hold/40',
      bar: 'bg-hold',
      band: 'bg-hold-band/80',
      icon: '■',
    }
  }
  if (status === 'caution' || status === 'review' || status === 'look') {
    return {
      word: 'Boundary',
      chip: 'bg-look-bg text-look border-look/40',
      bar: 'bg-look',
      band: 'bg-look-band/80',
      icon: '▲',
    }
  }
  return {
    word: 'In spec',
    chip: 'bg-pass-bg text-pass border-pass/40',
    bar: 'bg-pass',
    band: 'bg-pass-band/80',
    icon: '●',
  }
}

/** Presenter notes — not shown in Maya’s operational UI. */
export const PRESENTER_NOTES = {
  illustrativeData:
    'Point estimates and specification limits come from the exercise. Uncertainty ranges (REPEAT_TICKS) and lab-coupon scatters are illustrative demo inputs, not production measurements. Current production models supply point estimates; uncertainty evidence is a proposed future capability. The scatter does not invent a laboratory y-value for the open sample; the screen says the laboratory reference is not yet available.',
  intervalRule:
    'Proposed prototype rules (validate with quality): inclusive specs. Entirely outside interval → Send for rework suggested; all three entirely inside → Accept suggested; otherwise (boundary overlap or missing evidence) → Send to engineer suggested. An outside interval beats engineer. Missing evidence blocks Accept. Point-estimate icons (Above/Below limit, Near limit, ✓) are separate from the sample suggestion. Suggestions never auto-record Maya’s decision.',
  boundaryCases:
    '#203 mass 15.50–15.70 includes the upper boundary and extends above it → Above limit on the point, Send to engineer suggested. #205 mass 14.48–14.65 crosses 14.5 (two decimals in Derek). A valid interval that only touches a boundary from inside remains eligible for Accept.',
  ownership:
    'Working assumption pending SirenOpt clarification: Maya owns routine Accept/Rework. After she confirms an escalation, Derek owns resolution and may record the final disposition. Maya can see status but cannot finalize Derek-owned cases. Returning a case to Maya would require an explicit ownership transfer (not implemented). Reopen of a completed record is limited to the disposition author.',
  escalation:
    'Escalation requires a confirmed operator reason (system finding is a separate field). One in-app case per sample; no email/Slack. Verification: request → awaiting verification → record returned evidence → awaiting engineer → explicit Accept/Rework. Note-only evidence does not change measurements.',
  timeComparison:
    'For the take-home presentation, contrast Maya’s fuller vs compact layouts offline. Do not put a 20/2-minute switch in the operational app. Live navigation remains Maya/Derek.',
  assumptions:
    'Every sample needs an explicit Accept or Send for rework before review is complete. Session state clears on reload. Pending includes awaiting decision, awaiting engineer, and awaiting verification.',
}
