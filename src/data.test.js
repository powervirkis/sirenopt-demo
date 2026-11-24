import { describe, expect, it } from 'vitest'
import {
  PROPERTIES,
  PROPERTY_ORDER,
  SAMPLES,
  DECISION,
  classifyProperty,
  classifyVisual,
  formatValue,
  getDecision,
  setDecision,
  summarizeDecisions,
  recordEscalation,
} from './data'

const EXPECTED_VALUES = {
  201: { massLoading: 15.1, porosity: 35.6, sheetResistance: 0.31 },
  202: { massLoading: 14.9, porosity: 33.2, sheetResistance: 0.26 },
  203: { massLoading: 15.6, porosity: 34.0, sheetResistance: 0.29 },
  204: { massLoading: 15.0, porosity: 36.4, sheetResistance: 0.24 },
  205: { massLoading: 14.6, porosity: 32.5, sheetResistance: 0.41 },
  206: { massLoading: 15.2, porosity: 34.8, sheetResistance: 0.3 },
}

const EXPECTED_SUGGESTIONS = {
  201: 'engineer',
  202: 'accept',
  203: 'engineer',
  204: 'rework',
  205: 'rework',
  206: 'accept',
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

describe('visual status icons', () => {
  it('marks #201 porosity near limit and others ok', () => {
    const s = SAMPLES.find((x) => x.id === 201)
    expect(s.visualStatus.massLoading).toBe('ok')
    expect(s.visualStatus.porosity).toBe('near')
    expect(s.visualStatus.sheetResistance).toBe('ok')
  })

  it('marks #202 and #206 all green', () => {
    ;[202, 206].forEach((id) => {
      const s = SAMPLES.find((x) => x.id === id)
      PROPERTY_ORDER.forEach((key) => {
        expect(s.visualStatus[key]).toBe('ok')
      })
    })
  })

  it('marks #203 mass high while interval overlaps (not fully outside)', () => {
    const s = SAMPLES.find((x) => x.id === 203)
    expect(s.visualStatus.massLoading).toBe('high')
    expect(s.propertyStatus.massLoading).toBe('caution')
    expect(s.bands.massLoading.low).toBe(15.5)
    expect(s.bands.massLoading.high).toBe(15.7)
  })

  it('marks #204 porosity high and fully outside', () => {
    const s = SAMPLES.find((x) => x.id === 204)
    expect(s.visualStatus.porosity).toBe('high')
    expect(s.propertyStatus.porosity).toBe('fail')
  })

  it('marks #205 mass near limit and resistance high', () => {
    const s = SAMPLES.find((x) => x.id === 205)
    expect(s.visualStatus.massLoading).toBe('near')
    expect(s.visualStatus.sheetResistance).toBe('high')
    expect(s.propertyStatus.sheetResistance).toBe('fail')
  })
})

describe('suggestions', () => {
  it('matches expected fixture table without hardcoding by id in logic', () => {
    SAMPLES.forEach((s) => {
      expect(s.suggestion.kind).toBe(EXPECTED_SUGGESTIONS[s.id])
    })
  })

  it('uses short actionable reasons for engineer/rework', () => {
    expect(SAMPLES.find((s) => s.id === 201).suggestion.reason).toMatch(/Porosity near limit/i)
    expect(SAMPLES.find((s) => s.id === 203).suggestion.reason).toMatch(/Mass loading/i)
  })

  it('exposes #205 mass precision that crosses 14.5', () => {
    const s = SAMPLES.find((x) => x.id === 205)
    expect(s.bands.massLoading.low).toBe(14.48)
    expect(s.propertyStatus.massLoading).toBe('caution')
    expect(formatValue('massLoading', s.bands.massLoading.low, { range: true })).toBe('14.48')
  })
})

describe('Maya decisions', () => {
  it('starts with six awaiting', () => {
    const sum = summarizeDecisions(SAMPLES, {})
    expect(sum).toEqual({
      awaiting: 6,
      accepted: 0,
      rework: 0,
      engineer: 0,
      unresolved: 6,
      complete: false,
    })
  })

  it('accepting #202 changes only #202', () => {
    const d = setDecision({}, 202, DECISION.accepted)
    expect(getDecision(d, 202)).toBe('accepted')
    expect(getDecision(d, 206)).toBe('awaiting')
    expect(summarizeDecisions(SAMPLES, d)).toMatchObject({
      awaiting: 5,
      accepted: 1,
      rework: 0,
      engineer: 0,
      unresolved: 5,
    })
  })

  it('sending #205 for rework changes only #205', () => {
    const d = setDecision({}, 205, DECISION.rework)
    expect(getDecision(d, 205)).toBe('rework')
    expect(getDecision(d, 204)).toBe('awaiting')
  })

  it('send to engineer is unresolved and does not complete the batch', () => {
    const d = setDecision({}, 201, DECISION.engineer)
    const sum = summarizeDecisions(SAMPLES, d)
    expect(getDecision(d, 201)).toBe('engineer')
    expect(sum.engineer).toBe(1)
    expect(sum.unresolved).toBe(6)
    expect(sum.complete).toBe(false)
  })

  it('four state counts always total six', () => {
    let d = setDecision({}, 201, DECISION.engineer)
    d = setDecision(d, 202, DECISION.accepted)
    d = setDecision(d, 204, DECISION.rework)
    const sum = summarizeDecisions(SAMPLES, d)
    expect(sum.awaiting + sum.accepted + sum.rework + sum.engineer).toBe(6)
  })

  it('correcting a decision does not double-count', () => {
    let d = setDecision({}, 202, DECISION.accepted)
    d = setDecision(d, 202, DECISION.rework)
    d = setDecision(d, 202, DECISION.engineer)
    d = setDecision(d, 202, DECISION.accepted)
    expect(summarizeDecisions(SAMPLES, d).accepted).toBe(1)
    expect(summarizeDecisions(SAMPLES, d).rework).toBe(0)
    expect(summarizeDecisions(SAMPLES, d).engineer).toBe(0)
  })

  it('completing all six requires accept or rework for every sample', () => {
    let d = {}
    SAMPLES.forEach((s, i) => {
      d = setDecision(d, s.id, i % 2 === 0 ? DECISION.accepted : DECISION.rework)
    })
    const sum = summarizeDecisions(SAMPLES, d)
    expect(sum.awaiting).toBe(0)
    expect(sum.engineer).toBe(0)
    expect(sum.unresolved).toBe(0)
    expect(sum.complete).toBe(true)
    expect(sum.accepted + sum.rework).toBe(6)
  })

  it('idempotent same decision leaves state unchanged', () => {
    const d1 = setDecision({}, 202, DECISION.accepted)
    const d2 = setDecision(d1, 202, DECISION.accepted)
    expect(d2).toBe(d1)
  })
})

describe('escalations', () => {
  it('records one escalation even after repeated sends', () => {
    const sample = SAMPLES.find((s) => s.id === 201)
    let esc = recordEscalation({}, sample)
    const first = esc[201]
    esc = recordEscalation(esc, sample)
    expect(esc[201]).toBe(first)
    expect(esc[201].sampleId).toBe(201)
    expect(esc[201].values.porosity).toBe(35.6)
    expect(esc[201].bands.porosity).toEqual({ low: 35.2, high: 36.1 })
    expect(esc[201].reason).toMatch(/Porosity near limit/i)
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

  it('visual: point outside is high/low; in-spec with overlap is near; full in is ok', () => {
    expect(classifyVisual('porosity', 34, [33, 35])).toBe('ok')
    expect(classifyVisual('porosity', 36, [35, 36])).toBe('ok')
    expect(classifyVisual('porosity', 35.6, [35.2, 36.1])).toBe('near')
    expect(classifyVisual('porosity', 36.4, [36.1, 36.9])).toBe('high')
    expect(classifyVisual('massLoading', 14.4, [14.3, 14.45])).toBe('low')
    expect(classifyVisual('porosity', 35, null)).toBe('unavailable')
  })
})
