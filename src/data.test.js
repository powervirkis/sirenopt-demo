import { describe, expect, it } from 'vitest'
import {
  PROPERTIES,
  PROPERTY_ORDER,
  SAMPLES,
  DECISION,
  ACTOR,
  VISUAL_META,
  OPERATOR_REASON_MISSING,
  classifyProperty,
  classifyVisual,
  formatValue,
  getCase,
  summarizeCases,
  mayaDecide,
  confirmEscalation,
  derekResolve,
  requestVerification,
  recordVerificationEvidence,
  reopenCase,
  listEscalations,
  canMayaDecide,
  canDerekResolve,
  chartFocusCopy,
  queueReasonPreview,
  historyEntries,
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

const FIXED_AT = '2026-11-24T05:00:00.000Z'

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
  it('matches expected fixture table without hardcoding by id in logic', () => {
    SAMPLES.forEach((s) => {
      expect(s.suggestion.kind).toBe(EXPECTED_SUGGESTIONS[s.id])
    })
  })

  it('keeps #203 above-limit point with engineer suggestion', () => {
    const s = SAMPLES.find((x) => x.id === 203)
    expect(s.visualStatus.massLoading).toBe('high')
    expect(s.propertyStatus.massLoading).toBe('caution')
    expect(s.suggestion.kind).toBe('engineer')
  })

  it('keeps #205 resistance rework despite mass near limit', () => {
    const s = SAMPLES.find((x) => x.id === 205)
    expect(s.visualStatus.massLoading).toBe('near')
    expect(s.propertyStatus.sheetResistance).toBe('fail')
    expect(s.suggestion.kind).toBe('rework')
  })

  it('exposes #205 mass precision that crosses 14.5', () => {
    const s = SAMPLES.find((x) => x.id === 205)
    expect(s.bands.massLoading.low).toBe(14.48)
    expect(formatValue('massLoading', s.bands.massLoading.low, { range: true })).toBe('14.48')
  })

  it('uses above/below limit visual labels', () => {
    expect(VISUAL_META.high.label).toBe('Above limit')
    expect(VISUAL_META.low.label).toBe('Below limit')
  })
})

describe('shared case workflow', () => {
  it('starts with six awaiting and empty escalation queue', () => {
    const sum = summarizeCases(SAMPLES, {})
    expect(sum).toMatchObject({
      awaiting: 6,
      accepted: 0,
      rework: 0,
      engineer: 0,
      verification: 0,
      unresolved: 6,
      complete: false,
    })
    expect(listEscalations(SAMPLES, {})).toEqual([])
  })

  it('supports mixed routing counts', () => {
    let cases = {}
    cases = mayaDecide(cases, 202, DECISION.accepted, { at: FIXED_AT })
    cases = mayaDecide(cases, 206, DECISION.accepted, { at: FIXED_AT })
    cases = mayaDecide(cases, 204, DECISION.rework, { at: FIXED_AT })
    cases = mayaDecide(cases, 205, DECISION.rework, { at: FIXED_AT })
    cases = confirmEscalation(cases, SAMPLES.find((s) => s.id === 201), {
      reasonId: 'uncertain',
      at: FIXED_AT,
    })
    cases = confirmEscalation(cases, SAMPLES.find((s) => s.id === 203), {
      reasonId: 'unexpected',
      at: FIXED_AT,
    })
    const sum = summarizeCases(SAMPLES, cases)
    expect(sum.accepted).toBe(2)
    expect(sum.rework).toBe(2)
    expect(sum.engineer).toBe(2)
    expect(sum.completed).toBe(4)
    expect(sum.complete).toBe(false)
    expect(listEscalations(SAMPLES, cases)).toHaveLength(2)
  })

  it('keeps system finding and operator reason separate in the snapshot', () => {
    const sample = SAMPLES.find((s) => s.id === 201)
    const cases = confirmEscalation({}, sample, {
      reasonId: 'mismatch',
      note: 'Looks off on the coupon.',
      at: FIXED_AT,
    })
    const c = getCase(cases, 201)
    expect(c.state).toBe(DECISION.engineer)
    expect(c.owner).toBe(ACTOR.derek)
    expect(c.escalation.systemFinding).toMatch(/Porosity near limit/i)
    expect(c.escalation.operatorReason).toBe('Does not match what I observe')
    expect(c.escalation.operatorNote).toBe('Looks off on the coupon.')
    expect(c.escalation.systemFinding).not.toBe(c.escalation.operatorReason)
    expect(c.escalation.values.porosity).toBe(35.6)
    expect(c.escalation.bands.porosity).toEqual({ low: 35.2, high: 36.1 })
  })

  it('does not duplicate escalation on repeated confirm', () => {
    const sample = SAMPLES.find((s) => s.id === 201)
    let cases = confirmEscalation({}, sample, { reasonId: 'uncertain', at: FIXED_AT })
    const first = cases[201]
    cases = confirmEscalation(cases, sample, { reasonId: 'setup', at: FIXED_AT })
    expect(cases[201]).toBe(first)
    expect(listEscalations(SAMPLES, cases)).toHaveLength(1)
  })

  it('blocks Maya from finalizing a Derek-owned case', () => {
    const sample = SAMPLES.find((s) => s.id === 201)
    let cases = confirmEscalation({}, sample, { reasonId: 'uncertain', at: FIXED_AT })
    expect(canMayaDecide(getCase(cases, 201))).toBe(false)
    const blocked = mayaDecide(cases, 201, DECISION.accepted, { at: FIXED_AT })
    expect(blocked).toBe(cases)
    expect(getCase(blocked, 201).state).toBe(DECISION.engineer)
  })

  it('runs verification loop without changing measurements on note-only evidence', () => {
    const sample = SAMPLES.find((s) => s.id === 201)
    let cases = confirmEscalation({}, sample, { reasonId: 'uncertain', at: FIXED_AT })
    cases = requestVerification(cases, 201, {
      what: 'Repeat porosity scan',
      method: 'Plasma re-scan',
      responsible: 'Lab tech A',
      at: FIXED_AT,
    })
    expect(getCase(cases, 201).state).toBe(DECISION.verification)
    expect(summarizeCases(SAMPLES, cases).unresolved).toBe(6)

    const beforeValues = { ...sample.values }
    cases = recordVerificationEvidence(cases, 201, {
      source: 'Lab tech A',
      findings: 'Coupon rechecked; setup unchanged.',
      notes: 'No new numbers.',
      at: FIXED_AT,
    })
    expect(getCase(cases, 201).state).toBe(DECISION.engineer)
    expect(sample.values).toEqual(beforeValues)
    expect(getCase(cases, 201).verification.returned.findings).toMatch(/Coupon rechecked/)
    expect(canDerekResolve(getCase(cases, 201))).toBe(true)
  })

  it('resolves cases and supports author reopen with history', () => {
    let cases = {}
    SAMPLES.forEach((s) => {
      if (s.id === 201 || s.id === 203) {
        cases = confirmEscalation(cases, s, { reasonId: 'uncertain', at: FIXED_AT })
        cases = derekResolve(cases, s.id, DECISION.accepted, {
          reason: 'Boundary risk accepted for this batch.',
          at: FIXED_AT,
        })
      } else if (s.id === 204 || s.id === 205) {
        cases = mayaDecide(cases, s.id, DECISION.rework, { at: FIXED_AT })
      } else {
        cases = mayaDecide(cases, s.id, DECISION.accepted, { at: FIXED_AT })
      }
    })
    expect(summarizeCases(SAMPLES, cases).complete).toBe(true)
    expect(listEscalations(SAMPLES, cases)).toHaveLength(0)

    const beforeHistory = getCase(cases, 201).history.length
    cases = reopenCase(cases, 201, ACTOR.derek, { at: FIXED_AT })
    expect(summarizeCases(SAMPLES, cases).complete).toBe(false)
    expect(getCase(cases, 201).state).toBe(DECISION.engineer)
    expect(getCase(cases, 201).owner).toBe(ACTOR.derek)
    expect(getCase(cases, 201).disposition).toBeNull()
    expect(getCase(cases, 201).history.length).toBe(beforeHistory + 1)
    expect(getCase(cases, 201).history.at(-1).priorDisposition.kind).toBe(DECISION.accepted)

    const mayaBlocked = reopenCase(cases, 201, ACTOR.maya, { at: FIXED_AT })
    // still engineer-owned after derek reopen; maya cannot reopen again until she authored
    expect(mayaBlocked).toBe(cases)
  })

  it('requires a short reason for Derek resolution', () => {
    const sample = SAMPLES.find((s) => s.id === 203)
    let cases = confirmEscalation({}, sample, { reasonId: 'unexpected', at: FIXED_AT })
    const unchanged = derekResolve(cases, 203, DECISION.rework, { reason: '  ', at: FIXED_AT })
    expect(unchanged).toBe(cases)
  })

  it('shows missing operator reason placeholder when absent', () => {
    expect(OPERATOR_REASON_MISSING).toMatch(/not provided/i)
  })

  it('does not attribute an operator-only escalation to a measurement property', () => {
    const sample = SAMPLES.find((s) => s.id === 202)
    expect(sample.suggestion.propertyKey).toBeNull()
    expect(chartFocusCopy(sample).prompted).toBe(false)
    expect(chartFocusCopy(sample).text).toBe('Selected property: Porosity.')
    expect(chartFocusCopy(SAMPLES.find((s) => s.id === 201)).text).toMatch(
      /Focusing on Porosity/,
    )

    const cases = confirmEscalation({}, sample, {
      reasonId: 'other',
      note: 'TEST NOTE: sample identity label does not match the coupon.',
      at: FIXED_AT,
    })
    const record = getCase(cases, 202)
    expect(record.escalation.systemFinding).toMatch(/within inclusive limits/i)
    expect(record.escalation.operatorNote).toMatch(/TEST NOTE: sample identity/)
    expect(queueReasonPreview(record.escalation)).toMatch(/TEST NOTE: sample identity/)
    expect(queueReasonPreview(record.escalation)).not.toBe('Other')
    expect(getCase({}, 206).escalation).toBeNull()
  })

  it('keeps the prior resolution inspectable after reopen', () => {
    const sample = SAMPLES.find((s) => s.id === 202)
    let cases = confirmEscalation({}, sample, {
      reasonId: 'other',
      note: 'TEST NOTE: sample identity label does not match the coupon.',
      at: FIXED_AT,
    })
    cases = derekResolve(cases, 202, DECISION.accepted, {
      reason: 'TEST EXPLANATION: identity confirmed by Derek.',
      at: FIXED_AT,
    })
    expect(summarizeCases(SAMPLES, cases).complete).toBe(false)
    cases = reopenCase(cases, 202, ACTOR.derek, { at: '2026-11-24T06:00:00.000Z' })
    const record = getCase(cases, 202)
    expect(record.state).toBe(DECISION.engineer)
    expect(record.owner).toBe(ACTOR.derek)
    expect(record.disposition).toBeNull()
    expect(record.escalation.operatorNote).toMatch(/TEST NOTE/)
    const entries = historyEntries(record)
    expect(entries.some((entry) => entry.detail?.includes('TEST EXPLANATION'))).toBe(true)
    expect(
      entries.some(
        (entry) => entry.title === 'Reopened' && entry.actorLabel.includes('Derek'),
      ),
    ).toBe(true)
    expect(entries.find((entry) => entry.title === 'Reopened').at).toBe(
      '2026-11-24T06:00:00.000Z',
    )
    expect(listEscalations(SAMPLES, cases).map((item) => item.sample.id)).toEqual([202])
    expect(summarizeCases(SAMPLES, cases).complete).toBe(false)
  })

  it('previews a standard reason together with its note', () => {
    const sample = SAMPLES.find((s) => s.id === 201)
    const cases = confirmEscalation({}, sample, {
      reasonId: 'uncertain',
      note: 'TEST NOTE: porosity looks uneven on the edge.',
      at: FIXED_AT,
    })
    const preview = queueReasonPreview(getCase(cases, 201).escalation)
    expect(preview).toMatch(/Uncertain result/)
    expect(preview).toMatch(/TEST NOTE: porosity looks uneven/)
  })
})

describe('interval rules', () => {
  it('inclusive inside and touching pass; overlap is caution; outside is fail', () => {
    expect(classifyProperty('porosity', 34, [33, 35])).toBe('clear')
    expect(classifyProperty('porosity', 36, [35, 36])).toBe('clear')
    expect(classifyProperty('porosity', 35.6, [35.2, 36.1])).toBe('caution')
    expect(classifyProperty('porosity', 36.4, [36.1, 36.9])).toBe('fail')
  })

  it('visual: point outside is high/low; in-spec with overlap is near; full in is ok', () => {
    expect(classifyVisual('porosity', 34, [33, 35])).toBe('ok')
    expect(classifyVisual('porosity', 35.6, [35.2, 36.1])).toBe('near')
    expect(classifyVisual('porosity', 36.4, [36.1, 36.9])).toBe('high')
  })
})
