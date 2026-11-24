/** PlasmaSmart batch data and decision rules.
 *
 * Point estimates and specs come from the exercise.
 * Repeat-tick intervals are illustrative (existing demo inputs), not measured production outputs.
 *
 * Result (never rewritten by disposition):
 * - PASS: every property range fully inside inclusive spec
 * - NEEDS REVIEW: a range overlaps a limit, or evidence is missing
 * - FAIL: a valid range is fully outside spec (beats NEEDS REVIEW)
 *
 * Disposition: awaiting | accepted | held | review_requested
 */

export const ILLUSTRATIVE_DISCLOSURE =
  'Concept prototype. Point estimates come from the exercise; uncertainty ranges and diagnostic examples are illustrative.'

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
    halfWidth: 0.12,
    decimals: 1,
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
    halfWidth: 0.5,
    decimals: 1,
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
    halfWidth: 0.02,
    decimals: 2,
    viewMin: 0.15,
    viewMax: 0.48,
  },
}

export const PROPERTY_ORDER = ['massLoading', 'porosity', 'sheetResistance']

/**
 * Illustrative re-scan ticks (8 passes). Classification uses min–max of these ticks.
 * Existing demo intervals — not newly fabricated for this pass.
 */
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

/** Illustrative lab coupon coverage — engineer view only. */
export const LAB_COUPONS = {
  massLoading: {
    bins: [
      { range: '14.5–15.0', count: 38 },
      { range: '15.0–15.4', count: 42 },
      { range: '15.4–15.5', count: 9 },
      { range: '>15.5', count: 4 },
    ],
    sparseNote: 'Illustrative: weigh-up coupons thin above 15.4 mg/cm².',
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
    sparseNote: 'Illustrative: only 5 porosimetry coupons between 35.5–36%, 3 above 36%.',
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
    sparseNote: 'Illustrative: four-point lab checks sparse above 0.35 mΩ·cm².',
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

const RANK = { clear: 0, review: 1, fail: 2 }

export const DISPOSITION = {
  awaiting: 'awaiting',
  accepted: 'accepted',
  held: 'held',
  review_requested: 'review_requested',
}

export function formatValue(propertyKey, value) {
  const p = PROPERTIES[propertyKey]
  return Number(value).toFixed(p.decimals)
}

/** Band from repeat ticks when provided; else null (missing evidence). */
export function bandFor(propertyKey, value, ticks) {
  if (ticks && ticks.length) {
    return { low: Math.min(...ticks), high: Math.max(...ticks) }
  }
  return null
}

/**
 * Classify one property from an illustrative range vs inclusive spec.
 * Missing ticks → NEEDS REVIEW (do not invent a half-width band).
 */
export function classifyProperty(propertyKey, value, ticks) {
  const p = PROPERTIES[propertyKey]
  const band = bandFor(propertyKey, value, ticks)
  if (!band) return 'review'
  const { low, high } = band
  if (high < p.min || low > p.max) return 'fail'
  if (low < p.min || high > p.max) return 'review'
  return 'clear'
}

export function propertyExplanation(propertyKey, result, value, band) {
  const p = PROPERTIES[propertyKey]
  const point = formatValue(propertyKey, value)
  const spec = `${formatValue(propertyKey, p.min)}–${formatValue(propertyKey, p.max)} ${p.unit}`

  if (!band) {
    return {
      result: 'review',
      word: 'Needs review',
      reason: `${p.label} uncertainty evidence is missing or unverified.`,
      cardReason: `${p.label} evidence is missing.`,
      text: `Point ${point} ${p.unit}; range unavailable; spec ${spec}.`,
    }
  }

  const low = formatValue(propertyKey, band.low)
  const high = formatValue(propertyKey, band.high)
  const rangeText = `${low}–${high} ${p.unit}`

  if (result === 'fail') {
    if (band.low > p.max) {
      return {
        result: 'fail',
        word: 'Fail',
        reason: `${p.label} exceeds the ${formatValue(propertyKey, p.max)} ${p.unit} upper limit.`,
        cardReason: `${p.label} exceeds the ${formatValue(propertyKey, p.max)} ${p.unit} upper limit.`,
        text: `Point ${point} ${p.unit}; illustrative range ${rangeText}; spec ${spec}. Entire range is above the upper limit.`,
      }
    }
    if (band.high < p.min) {
      return {
        result: 'fail',
        word: 'Fail',
        reason: `${p.label} is below the ${formatValue(propertyKey, p.min)} ${p.unit} lower limit.`,
        cardReason: `${p.label} is below the ${formatValue(propertyKey, p.min)} ${p.unit} lower limit.`,
        text: `Point ${point} ${p.unit}; illustrative range ${rangeText}; spec ${spec}. Entire range is below the lower limit.`,
      }
    }
  }

  if (result === 'review') {
    if (band.high > p.max) {
      return {
        result: 'review',
        word: 'Needs review',
        reason: `${p.label} range crosses the ${formatValue(propertyKey, p.max)} ${p.unit} upper limit.`,
        cardReason: `${p.label} range crosses the ${formatValue(propertyKey, p.max)} ${p.unit} upper limit.`,
        text: `Point ${point} ${p.unit}; illustrative range ${rangeText}; spec ${spec}. Range overlaps the upper limit.`,
      }
    }
    if (band.low < p.min) {
      return {
        result: 'review',
        word: 'Needs review',
        reason: `${p.label} range crosses the ${formatValue(propertyKey, p.min)} ${p.unit} lower limit.`,
        cardReason: `${p.label} range crosses the ${formatValue(propertyKey, p.min)} ${p.unit} lower limit.`,
        text: `Point ${point} ${p.unit}; illustrative range ${rangeText}; spec ${spec}. Range overlaps the lower limit.`,
      }
    }
  }

  return {
    result: 'clear',
    word: 'Pass',
    reason: `${p.label} range is entirely within specification.`,
    cardReason: `${p.label} range is entirely within specification.`,
    text: `Point ${point} ${p.unit}; illustrative range ${rangeText}; spec ${spec}. Entirely within inclusive limits.`,
  }
}

function drivingFromProperties(raw, propertyStatus, bands, explanations) {
  const statuses = PROPERTY_ORDER.map((key) => ({
    key,
    status: propertyStatus[key],
  }))
  const worst = [...statuses].sort((a, b) => RANK[b.status] - RANK[a.status])[0]

  if (worst.status === 'clear') {
    return {
      propertyKey: null,
      phrase: 'All three ranges are entirely within specification.',
      cardReason: 'All three ranges are entirely within specification.',
      detail: 'Illustrative uncertainty ranges sit inside every inclusive spec window.',
    }
  }

  let key = worst.key
  if (worst.status === 'fail') {
    const fails = statuses.filter((s) => s.status === 'fail')
    key =
      fails.find((s) => s.key === 'sheetResistance')?.key ||
      fails.find((s) => s.key === 'porosity')?.key ||
      fails[0].key
  } else {
    const reviews = statuses.filter((s) => s.status === 'review')
    key =
      reviews.find((s) => s.key === 'porosity')?.key ||
      reviews.find((s) => s.key === 'massLoading')?.key ||
      reviews[0].key
  }

  const exp = explanations[key]
  return {
    propertyKey: key,
    phrase: exp.reason,
    cardReason: exp.cardReason,
    detail: exp.text,
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

  const ranks = PROPERTY_ORDER.map((k) => RANK[propertyStatus[k]])
  const worstRank = Math.max(...ranks)
  const result = worstRank === 2 ? 'fail' : worstRank === 1 ? 'review' : 'pass'
  // Keep legacy `status` alias for older call sites during transition
  const status = result === 'review' ? 'look' : result
  const drive = drivingFromProperties(raw, propertyStatus, bands, explanations)

  const secondary = PROPERTY_ORDER.filter(
    (k) => k !== drive.propertyKey && propertyStatus[k] !== 'clear',
  ).map((k) => explanations[k])

  return {
    ...raw,
    repeatTicks: ticks,
    bands,
    propertyStatus,
    explanations,
    result,
    status,
    drive,
    secondary,
  }
}

export const SAMPLES = RAW_SAMPLES.map((r) => enrichSample(r))

export const RESULT_META = {
  pass: {
    label: 'Pass',
    word: 'PASS',
    chip: 'bg-pass-bg text-pass border-pass/40',
    bar: 'bg-pass',
    band: 'bg-pass-band/70',
    row: 'border-l-pass',
    icon: '●',
  },
  review: {
    label: 'Needs review',
    word: 'NEEDS REVIEW',
    chip: 'bg-look-bg text-look border-look/40',
    bar: 'bg-look',
    band: 'bg-look-band/70',
    row: 'border-l-look',
    icon: '▲',
  },
  look: {
    label: 'Needs review',
    word: 'NEEDS REVIEW',
    chip: 'bg-look-bg text-look border-look/40',
    bar: 'bg-look',
    band: 'bg-look-band/70',
    row: 'border-l-look',
    icon: '▲',
  },
  fail: {
    label: 'Fail',
    word: 'FAIL',
    chip: 'bg-hold-bg text-hold border-hold/40',
    bar: 'bg-hold',
    band: 'bg-hold-band/70',
    row: 'border-l-hold',
    icon: '■',
  },
  clear: {
    label: 'Pass',
    word: 'PASS',
    chip: 'bg-pass-bg text-pass border-pass/40',
    bar: 'bg-pass',
    band: 'bg-pass-band/70',
    row: 'border-l-pass',
    icon: '●',
  },
}

/** @deprecated use RESULT_META */
export const STATUS_META = RESULT_META

export const DISPOSITION_META = {
  awaiting: { label: 'Awaiting decision', short: 'Awaiting' },
  accepted: { label: 'Accepted', short: 'Accepted' },
  held: { label: 'Held', short: 'Held' },
  review_requested: { label: 'Review requested', short: 'Review requested' },
}

export function getDisposition(dispositions, id) {
  return dispositions[id] || DISPOSITION.awaiting
}

/**
 * Counters derived from result + disposition.
 * Result counts never flip when disposition changes.
 */
export function summarize(samples, dispositions = {}) {
  let passingResults = 0
  let ready = 0
  let accepted = 0
  let needsReview = 0
  let fail = 0
  let held = 0
  let reviewRequested = 0

  samples.forEach((s) => {
    const result = s.result || (s.status === 'look' ? 'review' : s.status)
    const d = getDisposition(dispositions, s.id)

    if (result === 'pass') {
      passingResults += 1
      if (d === DISPOSITION.accepted) accepted += 1
      else ready += 1
    } else if (result === 'fail') {
      fail += 1
      if (d === DISPOSITION.held) held += 1
    } else {
      needsReview += 1
      if (d === DISPOSITION.review_requested) reviewRequested += 1
    }
  })

  return {
    passingResults,
    ready,
    accepted,
    needsReview,
    fail,
    held,
    reviewRequested,
    // legacy aliases used by older UI
    look: needsReview,
    hold: fail,
  }
}

/** @deprecated prefer summarize */
export function batchCounts(samples, dispositions = {}) {
  const s = summarize(samples, dispositions)
  return { ready: s.ready, look: s.needsReview, hold: s.fail, accepted: s.accepted }
}

export function canAccept(sample, dispositions) {
  const result = sample.result || (sample.status === 'look' ? 'review' : sample.status)
  return result === 'pass' && getDisposition(dispositions, sample.id) !== DISPOSITION.accepted
}

export function acceptOne(samples, dispositions, id) {
  const sample = samples.find((s) => s.id === id)
  if (!sample || !canAccept(sample, dispositions)) return dispositions
  return { ...dispositions, [id]: DISPOSITION.accepted }
}

export function acceptEligible(samples, dispositions) {
  const next = { ...dispositions }
  samples.forEach((s) => {
    if (canAccept(s, next)) next[s.id] = DISPOSITION.accepted
  })
  return next
}

export function holdOne(samples, dispositions, id) {
  const sample = samples.find((s) => s.id === id)
  if (!sample) return dispositions
  const result = sample.result || sample.status
  if (result !== 'fail') return dispositions
  return { ...dispositions, [id]: DISPOSITION.held }
}

export function requestReview(samples, dispositions, id) {
  const sample = samples.find((s) => s.id === id)
  if (!sample) return dispositions
  const result = sample.result || (sample.status === 'look' ? 'review' : sample.status)
  if (result !== 'review' && result !== 'look') return dispositions
  return { ...dispositions, [id]: DISPOSITION.review_requested }
}

export function packageForDerek(sample) {
  return {
    sampleId: sample.id,
    points: { ...sample.values },
    bands: Object.fromEntries(
      PROPERTY_ORDER.map((key) => [
        key,
        sample.bands[key]
          ? { low: sample.bands[key].low, high: sample.bands[key].high }
          : null,
      ]),
    ),
    specs: Object.fromEntries(
      PROPERTY_ORDER.map((key) => [
        key,
        {
          min: PROPERTIES[key].min,
          max: PROPERTIES[key].max,
          unit: PROPERTIES[key].unit,
        },
      ]),
    ),
    result: sample.result,
    drive: sample.drive.phrase,
  }
}

export const REVIEWER_HIDES = [
  {
    removed: 'Full property bars on exception rows',
    why: 'Under a 2-minute clock Maya works unresolved FAIL and NEEDS REVIEW first.',
  },
  {
    removed: 'Passing samples as full cards',
    why: 'Collapsed into one group with a scoped bulk Accept and individual detail links.',
  },
  {
    removed: 'Engineer diagnostics on the list',
    why: 'Repeatability and reference coverage stay on View engineer detail.',
  },
]

export const DECISION_RULE_COPY =
  'Decision rule (illustrative ranges vs inclusive specs): PASS when all three ranges are entirely within specification; NEEDS REVIEW when a range overlaps a limit or evidence is missing; FAIL when a valid range is entirely outside. A clear FAIL takes precedence over NEEDS REVIEW.'
