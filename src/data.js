/** PlasmaSmart batch data and decision rules.
 *
 * Point estimates and specs come from the exercise.
 * Repeat-tick intervals in REPEAT_TICKS are illustrative demo inputs.
 *
 * Measurement suggestion (never auto-records a decision):
 * - accept: all ranges entirely within inclusive spec
 * - caution: a range overlaps a limit (or evidence missing)
 * - rework: a valid range is entirely outside (beats caution)
 *
 * Maya decision: awaiting | accepted | rework
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
    // Low tick 14.48 crosses 14.5 — expose with rangeDecimals so Maya/Derek see 14.48–14.65
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

const RANK = { clear: 0, caution: 1, fail: 2 }

export const DECISION = {
  awaiting: 'awaiting',
  accepted: 'accepted',
  rework: 'rework',
}

export const DECISION_META = {
  awaiting: { label: 'Awaiting decision', short: 'Awaiting' },
  accepted: { label: 'Accepted', short: 'Accepted' },
  rework: { label: 'Sent for rework', short: 'Rework' },
}

export const SUGGESTION_META = {
  accept: { symbol: '✓', label: 'Accept suggested', className: 'text-pass' },
  caution: { symbol: '!', label: 'Boundary uncertain', className: 'text-look' },
  rework: { symbol: '↻', label: 'Rework suggested', className: 'text-hold' },
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

export function classifyProperty(propertyKey, value, ticks) {
  const p = PROPERTIES[propertyKey]
  const band = bandFor(propertyKey, value, ticks)
  if (!band) return 'caution'
  const { low, high } = band
  if (high < p.min || low > p.max) return 'fail'
  if (low < p.min || high > p.max) return 'caution'
  return 'clear'
}

export function propertyExplanation(propertyKey, status, value, band) {
  const p = PROPERTIES[propertyKey]
  const point = formatValue(propertyKey, value)
  const spec = `${formatValue(propertyKey, p.min)}–${formatValue(propertyKey, p.max)} ${p.unit}`

  if (!band) {
    return {
      status: 'caution',
      reason: `${p.short} evidence missing.`,
      shortReason: `${p.short} evidence missing.`,
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
          ? `Resistance exceeds ${limit} ${p.unit}.`
          : propertyKey === 'porosity'
            ? `Porosity exceeds ${limit}%.`
            : `Mass loading exceeds ${limit} ${p.unit}.`
      return {
        status: 'fail',
        reason: short,
        shortReason: short,
        text: `Point ${point} ${p.unit}; range ${rangeText}; spec ${spec}. Entire range above upper limit.`,
      }
    }
    const limit = formatValue(propertyKey, p.min)
    const short =
      propertyKey === 'porosity'
        ? `Porosity below ${limit}%.`
        : `Mass-loading range below ${limit} ${p.unit}.`
    return {
      status: 'fail',
      reason: short,
      shortReason: short,
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
            ? `Mass-loading range crosses ${limit} ${p.unit}.`
            : `Sheet R range crosses ${limit} ${p.unit}.`
      return {
        status: 'caution',
        reason: short,
        shortReason: short,
        text: `Point ${point} ${p.unit}; range ${rangeText}; spec ${spec}. Range overlaps upper limit.`,
      }
    }
    if (band.low < p.min) {
      const limit = formatValue(propertyKey, p.min)
      const short =
        propertyKey === 'massLoading'
          ? `Mass-loading range crosses ${limit} ${p.unit}.`
          : `${p.short} range crosses ${limit} ${p.unit}.`
      return {
        status: 'caution',
        reason: short,
        shortReason: short,
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

function buildSuggestion(propertyStatus, explanations) {
  const statuses = PROPERTY_ORDER.map((key) => propertyStatus[key])
  if (statuses.includes('fail')) {
    const key =
      PROPERTY_ORDER.find((k) => propertyStatus[k] === 'fail' && k === 'sheetResistance') ||
      PROPERTY_ORDER.find((k) => propertyStatus[k] === 'fail' && k === 'porosity') ||
      PROPERTY_ORDER.find((k) => propertyStatus[k] === 'fail')
    return {
      kind: 'rework',
      propertyKey: key,
      reason: explanations[key].shortReason,
    }
  }
  if (statuses.includes('caution')) {
    const key =
      PROPERTY_ORDER.find((k) => propertyStatus[k] === 'caution' && k === 'porosity') ||
      PROPERTY_ORDER.find((k) => propertyStatus[k] === 'caution' && k === 'massLoading') ||
      PROPERTY_ORDER.find((k) => propertyStatus[k] === 'caution')
    return {
      kind: 'caution',
      propertyKey: key,
      reason: explanations[key].shortReason,
    }
  }
  return { kind: 'accept', propertyKey: null, reason: '' }
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
  const bands = {}
  const explanations = {}

  PROPERTY_ORDER.forEach((key) => {
    const t = ticks[key]
    bands[key] = bandFor(key, raw.values[key], t)
    propertyStatus[key] = classifyProperty(key, raw.values[key], t)
    explanations[key] = propertyExplanation(
      key,
      propertyStatus[key],
      raw.values[key],
      bands[key],
    )
  })

  const suggestion = buildSuggestion(propertyStatus, explanations)
  const secondary = PROPERTY_ORDER.filter(
    (k) => k !== suggestion.propertyKey && propertyStatus[k] !== 'clear',
  ).map((k) => explanations[k])

  return {
    ...raw,
    repeatTicks: ticks,
    bands,
    propertyStatus,
    explanations,
    suggestion,
    secondary,
  }
}

export const SAMPLES = RAW_SAMPLES.map((r) => enrichSample(r))

export function getDecision(decisions, id) {
  return decisions[id] || DECISION.awaiting
}

/** Decision counts only — not suggestions. */
export function summarizeDecisions(samples, decisions = {}) {
  let awaiting = 0
  let accepted = 0
  let rework = 0
  samples.forEach((s) => {
    const d = getDecision(decisions, s.id)
    if (d === DECISION.accepted) accepted += 1
    else if (d === DECISION.rework) rework += 1
    else awaiting += 1
  })
  return {
    awaiting,
    accepted,
    rework,
    complete: awaiting === 0,
  }
}

/** Set or correct a decision. Accept and rework are mutually exclusive. Idempotent. */
export function setDecision(decisions, id, next) {
  if (next !== DECISION.accepted && next !== DECISION.rework) return decisions
  if (getDecision(decisions, id) === next) return decisions
  return { ...decisions, [id]: next }
}

export function RESULT_META_FOR_ENGINEER(status) {
  if (status === 'fail') {
    return { word: 'Outside spec', chip: 'bg-hold-bg text-hold border-hold/40', bar: 'bg-hold', band: 'bg-hold-band/80', icon: '■' }
  }
  if (status === 'caution' || status === 'review' || status === 'look') {
    return { word: 'Boundary', chip: 'bg-look-bg text-look border-look/40', bar: 'bg-look', band: 'bg-look-band/80', icon: '▲' }
  }
  return { word: 'In spec', chip: 'bg-pass-bg text-pass border-pass/40', bar: 'bg-pass', band: 'bg-pass-band/80', icon: '●' }
}

/** Presenter notes — not shown in operational UI. */
export const PRESENTER_NOTES = {
  illustrativeData:
    'Point estimates and specification limits come from the exercise. Uncertainty ranges (REPEAT_TICKS) and lab-coupon scatters are illustrative demo inputs, not production measurements.',
  intervalRule:
    'Inclusive specs: entirely inside → Accept suggested; overlaps a limit → Boundary uncertain; entirely outside → Rework suggested. A clear outside-spec property beats a boundary caution. Suggestions never auto-record Maya’s decision.',
  timeComparison:
    'For the take-home presentation, contrast a fuller Maya layout (inline values + reasons) with a compact layout (reasons + Accept / Send for rework). Both use the same data, suggestions, two actions, and decision states. Do not put a 20/2-minute switch in the operational app.',
  assumptions:
    'Every sample needs an explicit Accept or Send for rework before the line moves on. Session decisions clear on reload. #205 mass range 14.48–14.65 mg/cm² crosses 14.5 (shown with two decimals).',
}
