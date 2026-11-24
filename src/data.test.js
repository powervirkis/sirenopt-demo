import { describe, expect, it } from 'vitest'
import {
  PROPERTIES,
  PROPERTY_ORDER,
  SAMPLES,
  DECISION,
  classifyProperty,
  formatValue,
  getDecision,
  setDecision,
  summarizeDecisions,
} from './data'

const EXPECTED_VALUES = {
  201: { massLoading: 15.1, porosity: 35.6, sheetResistance: 0.31 },
  202: { massLoading: 14.9, porosity: 33.2, sheetResistance: 0.26 },
  203: { massLoading: 15.6, porosity: 34.0, sheetResistance: 0.29 },
  204: { massLoading: 15.0, porosity: 36.4, sheetResistance: 0.24 },
  205: { massLoading: 14.6, porosity: 32.5, sheetResistance: 0.41 },
  206: { massLoading: 15.2, porosity: 34.8, sheetResistance: 0.3 },
}

describe('supplied data', () => {
  it('preserves all 18 values and specs', () => {
    expect(PROPERTIES.massLoading.min).toBe(14.5)
    expect(PROPERTIES.massLoading.max).toBe(15.5)
    expect(PROPERTIES.sheetResistance.unit).toBe('mΩ·cm²')
    SAMPLES.forEach((s) => {
      PROPERTY_ORDER.forEach((key) => {
        expect(s.values[key]).toBe(EXPECTED_VALUES[s.id][key])
      })
    })
  })
})

describe('suggestions', () => {
  it('suggests accept for fully in-spec ranges', () => {
    expect(SAMPLES.find((s) => s.id === 202).suggestion.kind).toBe('accept')
    expect(SAMPLES.find((s) => s.id === 206).suggestion.kind).toBe('accept')
  })

  it('suggests caution for boundary overlap without auto-deciding', () => {
    const s201 = SAMPLES.find((s) => s.id === 201)
    expect(s201.suggestion.kind).toBe('caution')
    expect(s201.suggestion.reason).toMatch(/Porosity range crosses 36/)
    const s203 = SAMPLES.find((s) => s.id === 203)
    expect(s203.suggestion.kind).toBe('caution')
  })

  it('suggests rework when a range is fully outside', () => {
    expect(SAMPLES.find((s) => s.id === 204).suggestion.kind).toBe('rework')
    expect(SAMPLES.find((s) => s.id === 205).suggestion.kind).toBe('rework')
  })

  it('exposes #205 mass precision that crosses 14.5', () => {
    const s = SAMPLES.find((x) => x.id === 205)
    expect(s.bands.massLoading.low).toBe(14.48)
    expect(s.propertyStatus.massLoading).toBe('caution')
    expect(formatValue('massLoading', s.bands.massLoading.low, { range: true })).toBe('14.48')
    expect(s.explanations.massLoading.shortReason).toMatch(/14\.5/)
  })
})

describe('Maya decisions', () => {
  it('starts with six awaiting', () => {
    const sum = summarizeDecisions(SAMPLES, {})
    expect(sum).toEqual({ awaiting: 6, accepted: 0, rework: 0, complete: false })
  })

  it('accepting #202 changes only #202', () => {
    const d = setDecision({}, 202, DECISION.accepted)
    expect(getDecision(d, 202)).toBe('accepted')
    expect(getDecision(d, 206)).toBe('awaiting')
    expect(summarizeDecisions(SAMPLES, d)).toMatchObject({
      awaiting: 5,
      accepted: 1,
      rework: 0,
    })
  })

  it('sending #205 for rework changes only #205', () => {
    const d = setDecision({}, 205, DECISION.rework)
    expect(getDecision(d, 205)).toBe('rework')
    expect(getDecision(d, 204)).toBe('awaiting')
  })

  it('correcting a decision does not double-count', () => {
    let d = setDecision({}, 202, DECISION.accepted)
    d = setDecision(d, 202, DECISION.rework)
    d = setDecision(d, 202, DECISION.accepted)
    expect(summarizeDecisions(SAMPLES, d).accepted).toBe(1)
    expect(summarizeDecisions(SAMPLES, d).rework).toBe(0)
  })

  it('completing all six yields zero awaiting', () => {
    let d = {}
    SAMPLES.forEach((s, i) => {
      d = setDecision(d, s.id, i % 2 === 0 ? DECISION.accepted : DECISION.rework)
    })
    const sum = summarizeDecisions(SAMPLES, d)
    expect(sum.awaiting).toBe(0)
    expect(sum.complete).toBe(true)
    expect(sum.accepted + sum.rework).toBe(6)
  })

  it('idempotent same decision leaves state unchanged', () => {
    const d1 = setDecision({}, 202, DECISION.accepted)
    const d2 = setDecision(d1, 202, DECISION.accepted)
    expect(d2).toBe(d1)
  })
})

describe('interval rules', () => {
  it('inclusive inside and touching pass; overlap is caution; outside is fail', () => {
    expect(classifyProperty('porosity', 34, [33, 35])).toBe('clear')
    expect(classifyProperty('porosity', 36, [35, 36])).toBe('clear')
    expect(classifyProperty('porosity', 35.6, [35.2, 36.1])).toBe('caution')
    expect(classifyProperty('porosity', 36.4, [36.1, 36.9])).toBe('fail')
    expect(classifyProperty('porosity', 35, null)).toBe('caution')
  })
})
