import { describe, expect, it } from 'vitest'
import {
  PROPERTIES,
  PROPERTY_ORDER,
  SAMPLES,
  acceptEligible,
  acceptOne,
  bandFor,
  classifyProperty,
  holdOne,
  requestReview,
  summarize,
} from './data'

// Re-export raw values for assertion without mutating SAMPLES
const EXPECTED_VALUES = {
  201: { massLoading: 15.1, porosity: 35.6, sheetResistance: 0.31 },
  202: { massLoading: 14.9, porosity: 33.2, sheetResistance: 0.26 },
  203: { massLoading: 15.6, porosity: 34.0, sheetResistance: 0.29 },
  204: { massLoading: 15.0, porosity: 36.4, sheetResistance: 0.24 },
  205: { massLoading: 14.6, porosity: 32.5, sheetResistance: 0.41 },
  206: { massLoading: 15.2, porosity: 34.8, sheetResistance: 0.3 },
}

describe('supplied exercise data', () => {
  it('preserves all 18 values and three spec windows', () => {
    expect(PROPERTIES.massLoading.min).toBe(14.5)
    expect(PROPERTIES.massLoading.max).toBe(15.5)
    expect(PROPERTIES.massLoading.unit).toBe('mg/cm²')
    expect(PROPERTIES.porosity.min).toBe(32)
    expect(PROPERTIES.porosity.max).toBe(36)
    expect(PROPERTIES.porosity.unit).toBe('%')
    expect(PROPERTIES.sheetResistance.min).toBe(0.2)
    expect(PROPERTIES.sheetResistance.max).toBe(0.35)
    expect(PROPERTIES.sheetResistance.unit).toBe('mΩ·cm²')

    SAMPLES.forEach((s) => {
      PROPERTY_ORDER.forEach((key) => {
        expect(s.values[key]).toBe(EXPECTED_VALUES[s.id][key])
      })
    })
  })

  it('locks expected sample results', () => {
    const byId = Object.fromEntries(SAMPLES.map((s) => [s.id, s]))
    expect(byId[202].result).toBe('pass')
    expect(byId[206].result).toBe('pass')
    expect(byId[201].result).toBe('review')
    expect(byId[201].propertyStatus.porosity).toBe('review')
    expect(byId[203].result).toBe('review')
    expect(byId[203].propertyStatus.massLoading).toBe('review')
    expect(byId[204].result).toBe('fail')
    expect(byId[204].propertyStatus.porosity).toBe('fail')
    expect(byId[205].result).toBe('fail')
    expect(byId[205].propertyStatus.sheetResistance).toBe('fail')
    expect(byId[205].propertyStatus.massLoading).toBe('review')
  })
})

describe('interval rules', () => {
  it('passes when range is entirely inside inclusive limits', () => {
    expect(classifyProperty('porosity', 34, [33, 34, 35])).toBe('clear')
  })

  it('passes when range touches a limit from inside', () => {
    expect(classifyProperty('porosity', 36, [35, 36])).toBe('clear')
    expect(classifyProperty('massLoading', 14.5, [14.5, 15.0])).toBe('clear')
  })

  it('needs review when range extends outside while overlapping a limit', () => {
    expect(classifyProperty('porosity', 35.6, [35.2, 36.1])).toBe('review')
    expect(classifyProperty('massLoading', 15.6, [15.5, 15.7])).toBe('review')
  })

  it('fails when range is entirely outside', () => {
    expect(classifyProperty('porosity', 36.4, [36.1, 36.9])).toBe('fail')
    expect(classifyProperty('sheetResistance', 0.41, [0.39, 0.43])).toBe('fail')
  })

  it('needs review when ticks are missing', () => {
    expect(classifyProperty('porosity', 35.6, null)).toBe('review')
    expect(classifyProperty('porosity', 35.6, [])).toBe('review')
    expect(bandFor('porosity', 35.6, null)).toBeNull()
  })

  it('fail takes precedence over needs review on #205', () => {
    const s = SAMPLES.find((x) => x.id === 205)
    expect(s.result).toBe('fail')
    expect(s.propertyStatus.massLoading).toBe('review')
  })
})

describe('acceptance and hold workflow', () => {
  it('accepting #202 changes only #202 and leaves one ready', () => {
    let d = {}
    const initial = summarize(SAMPLES, d)
    expect(initial.passingResults).toBe(2)
    expect(initial.ready).toBe(2)
    expect(initial.accepted).toBe(0)

    d = acceptOne(SAMPLES, d, 202)
    const after = summarize(SAMPLES, d)
    expect(after.passingResults).toBe(2)
    expect(after.ready).toBe(1)
    expect(after.accepted).toBe(1)
    expect(d[202]).toBe('accepted')
    expect(d[206]).toBeUndefined()
  })

  it('bulk acceptance changes only eligible passing samples', () => {
    let d = acceptOne(SAMPLES, {}, 202)
    d = acceptEligible(SAMPLES, d)
    const after = summarize(SAMPLES, d)
    expect(after.ready).toBe(0)
    expect(after.accepted).toBe(2)
    expect(d[201]).toBeUndefined()
    expect(d[204]).toBeUndefined()
  })

  it('repeated accept is idempotent', () => {
    let d = acceptOne(SAMPLES, {}, 202)
    d = acceptOne(SAMPLES, d, 202)
    d = acceptEligible(SAMPLES, d)
    d = acceptEligible(SAMPLES, d)
    expect(summarize(SAMPLES, d).accepted).toBe(2)
  })

  it('holding #204 leaves #205 unchanged and keeps FAIL result', () => {
    const d = holdOne(SAMPLES, {}, 204)
    expect(d[204]).toBe('held')
    expect(d[205]).toBeUndefined()
    const s204 = SAMPLES.find((s) => s.id === 204)
    expect(s204.result).toBe('fail')
    const sum = summarize(SAMPLES, d)
    expect(sum.fail).toBe(2)
    expect(sum.held).toBe(1)
  })

  it('request review does not change result', () => {
    const d = requestReview(SAMPLES, {}, 201)
    expect(d[201]).toBe('review_requested')
    expect(SAMPLES.find((s) => s.id === 201).result).toBe('review')
  })
})
