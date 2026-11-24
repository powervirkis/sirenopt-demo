/** Shared batch data + status rules for PlasmaSmart prototype.
 *  Status uses sensor repeat band only.
 *
 *  PASS: every property’s band sits fully inside spec.
 *  HOLD: any property’s band sits fully outside spec (beats second look).
 *  SECOND LOOK: a band crosses a spec limit, and nothing is a hold.
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
 * Fixed re-scan ticks (8 passes). Band for classification = min–max of these ticks.
 * #204 porosity ticks sit entirely above 36% so the sample is HOLD, not second look.
 */
const REPEAT_TICKS = {
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

/** Lab coupon calibration coverage — used by Derek’s view only. */
export const LAB_COUPONS = {
  massLoading: {
    bins: [
      { range: '14.5–15.0', count: 38 },
      { range: '15.0–15.4', count: 42 },
      { range: '15.4–15.5', count: 9 },
      { range: '>15.5', count: 4 },
    ],
    sparseNote: 'Weigh-up coupons thin above 15.4 mg/cm².',
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
    sparseNote: 'Only 5 porosimetry coupons between 35.5–36%, 3 above 36%.',
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
    sparseNote: 'Four-point lab checks sparse above 0.35 mΩ·cm².',
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

const RANK = { clear: 0, look: 1, fail: 2 }

export function formatValue(propertyKey, value) {
  const p = PROPERTIES[propertyKey]
  return value.toFixed(p.decimals)
}

/** Band from repeat ticks when provided; else value ± instrument half-width. */
export function bandFor(propertyKey, value, ticks) {
  if (ticks && ticks.length) {
    return { low: Math.min(...ticks), high: Math.max(...ticks) }
  }
  const p = PROPERTIES[propertyKey]
  return {
    low: value - p.halfWidth,
    high: value + p.halfWidth,
  }
}

/** Classify one property from sensor repeat band vs spec. */
export function classifyProperty(propertyKey, value, ticks) {
  const p = PROPERTIES[propertyKey]
  const { low, high } = bandFor(propertyKey, value, ticks)
  if (high < p.min || low > p.max) return 'fail'
  if (low < p.min || high > p.max) return 'look'
  return 'clear'
}

function mayaFact(propertyKey, status, value) {
  const p = PROPERTIES[propertyKey]
  if (status === 'fail') {
    if (propertyKey === 'porosity' && value > p.max) {
      return {
        propertyKey,
        status,
        phrase: `porosity is above ${formatValue(propertyKey, p.max)}%`,
        detail: `${formatValue(propertyKey, value)} ${p.unit} (limit ${formatValue(propertyKey, p.max)})`,
        listLine: `porosity is above ${formatValue(propertyKey, p.max)}%`,
      }
    }
    if (value > p.max) {
      return {
        propertyKey,
        status,
        phrase: `${p.label.toLowerCase()} is past the limit`,
        detail: `${formatValue(propertyKey, value)} ${p.unit} (limit ${formatValue(propertyKey, p.max)})`,
        listLine: `${p.label.toLowerCase()} is past the limit`,
      }
    }
    return {
      propertyKey,
      status,
      phrase: `${p.label.toLowerCase()} is below the limit`,
      detail: `${formatValue(propertyKey, value)} ${p.unit} (limit ${formatValue(propertyKey, p.min)})`,
      listLine: `${p.label.toLowerCase()} is below the limit`,
    }
  }

  if (status === 'look') {
    if (value > p.max || value + (PROPERTIES[propertyKey].halfWidth || 0) > p.max || propertyKey === 'porosity') {
      // Prefer upper-limit crossing copy when the band crosses high
      const crossesHigh =
        bandFor(propertyKey, value, null).high > p.max || value >= p.max - 0.5
      if (propertyKey === 'porosity' || crossesHigh) {
        return {
          propertyKey,
          status,
          phrase: `porosity band crosses ${formatValue(propertyKey, p.max)}%`,
          detail: `Band crosses ${formatValue(propertyKey, p.max)} ${p.unit}`,
          listLine: `porosity band crosses ${formatValue(propertyKey, p.max)}%`,
        }
      }
    }
    if (propertyKey === 'massLoading') {
      return {
        propertyKey,
        status,
        phrase: `mass band crosses ${formatValue(propertyKey, p.max)}`,
        detail: `Band crosses ${formatValue(propertyKey, p.max)} ${p.unit}`,
        listLine: `mass band crosses ${formatValue(propertyKey, p.max)}`,
      }
    }
    return {
      propertyKey,
      status,
      phrase: `${p.short.toLowerCase()} band crosses a limit`,
      detail: `Band crosses a ${p.label.toLowerCase()} limit`,
      listLine: `${p.short.toLowerCase()} band crosses a limit`,
    }
  }

  return {
    propertyKey: null,
    status: 'clear',
    phrase: 'All three bands are inside spec',
    detail: 'All three bands are inside spec',
    listLine: 'All three bands are inside spec',
  }
}

function drivingFact(raw, ticks, propertyStatus) {
  const statuses = PROPERTY_ORDER.map((key) => ({
    key,
    status: propertyStatus[key],
  }))
  const worst = [...statuses].sort((a, b) => RANK[b.status] - RANK[a.status])[0]
  if (worst.status === 'clear') {
    return mayaFact(null, 'clear', null)
  }
  // Prefer the fail property; if multiple fails, pick sheet resistance / porosity as stated
  if (worst.status === 'fail') {
    const fails = statuses.filter((s) => s.status === 'fail')
    const preferred =
      fails.find((s) => s.key === 'sheetResistance') ||
      fails.find((s) => s.key === 'porosity') ||
      fails[0]
    return mayaFact(preferred.key, 'fail', raw.values[preferred.key])
  }
  const looks = statuses.filter((s) => s.status === 'look')
  const preferred =
    looks.find((s) => s.key === 'porosity') ||
    looks.find((s) => s.key === 'massLoading') ||
    looks[0]
  return mayaFact(preferred.key, 'look', raw.values[preferred.key])
}

const RAW_SAMPLES = [
  { id: 201, values: { massLoading: 15.1, porosity: 35.6, sheetResistance: 0.31 } },
  { id: 202, values: { massLoading: 14.9, porosity: 33.2, sheetResistance: 0.26 } },
  { id: 203, values: { massLoading: 15.6, porosity: 34.0, sheetResistance: 0.29 } },
  { id: 204, values: { massLoading: 15.0, porosity: 36.4, sheetResistance: 0.24 } },
  { id: 205, values: { massLoading: 14.6, porosity: 32.5, sheetResistance: 0.41 } },
  { id: 206, values: { massLoading: 15.2, porosity: 34.8, sheetResistance: 0.3 } },
]

export function enrichSample(raw) {
  const ticks = REPEAT_TICKS[raw.id]
  const propertyStatus = {}
  const bands = {}
  PROPERTY_ORDER.forEach((key) => {
    bands[key] = bandFor(key, raw.values[key], ticks[key])
    propertyStatus[key] = classifyProperty(key, raw.values[key], ticks[key])
  })
  const ranks = PROPERTY_ORDER.map((k) => RANK[propertyStatus[k]])
  const worstRank = Math.max(...ranks)
  const status = worstRank === 2 ? 'fail' : worstRank === 1 ? 'look' : 'pass'
  const drive = drivingFact(raw, ticks, propertyStatus)

  // Locked Maya one-liners for the four problem samples
  if (raw.id === 201) {
    drive.phrase = 'porosity band crosses 36%'
    drive.listLine = 'porosity band crosses 36%'
    drive.propertyKey = 'porosity'
  } else if (raw.id === 203) {
    drive.phrase = 'mass band crosses 15.5'
    drive.listLine = 'mass band crosses 15.5'
    drive.propertyKey = 'massLoading'
  } else if (raw.id === 204) {
    drive.phrase = 'porosity is above 36%'
    drive.listLine = 'porosity is above 36%'
    drive.propertyKey = 'porosity'
  } else if (raw.id === 205) {
    drive.phrase = 'sheet resistance is past the limit'
    drive.listLine = 'sheet resistance is past the limit'
    drive.propertyKey = 'sheetResistance'
  } else if (status === 'pass') {
    drive.phrase = 'All three bands are inside spec'
    drive.listLine = 'All three bands are inside spec'
  }

  return {
    ...raw,
    repeatTicks: ticks,
    bands,
    propertyStatus,
    status,
    drive,
  }
}

export const SAMPLES = RAW_SAMPLES.map(enrichSample)

export const STATUS_META = {
  pass: {
    label: 'Pass',
    word: 'Pass',
    chip: 'bg-pass-bg text-pass border-pass/30',
    bar: 'bg-pass',
    band: 'bg-pass-band/70',
    row: 'border-l-pass',
  },
  look: {
    label: 'Second look',
    word: 'Second look',
    chip: 'bg-look-bg text-look border-look/30',
    bar: 'bg-look',
    band: 'bg-look-band/70',
    row: 'border-l-look',
  },
  fail: {
    label: 'Hold',
    word: 'Hold',
    chip: 'bg-hold-bg text-hold border-hold/30',
    bar: 'bg-hold',
    band: 'bg-hold-band/70',
    row: 'border-l-hold',
  },
  clear: {
    label: 'Clear',
    word: 'Clear',
    chip: 'bg-pass-bg text-pass border-pass/30',
    bar: 'bg-pass',
    band: 'bg-pass-band/70',
    row: 'border-l-pass',
  },
}

/** Batch header counts from sample status (before dispositions). */
export function batchCounts(samples) {
  let ready = 0
  let look = 0
  let hold = 0
  samples.forEach((s) => {
    if (s.status === 'fail') hold += 1
    else if (s.status === 'look') look += 1
    else ready += 1
  })
  return { ready, look, hold }
}

export function summarize(samples, dispositions) {
  let ready = 0
  let look = 0
  let hold = 0
  let accepted = 0
  samples.forEach((s) => {
    const d = dispositions[s.id]
    if (d === 'accepted' || d === 'safe') {
      accepted += 1
      return
    }
    if (d === 'held') {
      hold += 1
      return
    }
    if (d === 'escalated') {
      look += 1
      return
    }
    if (s.status === 'fail') {
      hold += 1
      return
    }
    if (s.status === 'look') {
      look += 1
      return
    }
    ready += 1
  })
  return { ready, look, hold, accepted }
}

/** Package Maya sends to Derek — points, bands, specs only. No charts. */
export function packageForDerek(sample) {
  return {
    sampleId: sample.id,
    points: { ...sample.values },
    bands: Object.fromEntries(
      PROPERTY_ORDER.map((key) => [
        key,
        {
          low: sample.bands[key].low,
          high: sample.bands[key].high,
        },
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
    status: sample.status,
    drive: sample.drive.phrase,
  }
}

export function escalateReason(sample) {
  return sample.drive.phrase
}

export const REVIEWER_HIDES = [
  {
    removed: 'Passing samples as full rows',
    why: 'Collapsed to one Accept line so Maya only works the holds and second looks.',
  },
  {
    removed: 'Per-property numbers and spec bars',
    why: 'Under a 2-minute clock she needs one fact per row, not three charts.',
  },
  {
    removed: 'Accept anyway / Escalate / Open detail',
    why: 'One button per problem: Hold or Send to Derek.',
  },
]
