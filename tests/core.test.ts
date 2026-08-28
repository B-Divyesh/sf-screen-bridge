import { describe, expect, it } from 'vitest'
import { phrasesFromWords, targetPhrase, targetsFromWords } from '../src/core'

describe('target creation', () => {
  it('orders OCR words by screen position and assigns number keys', () => {
    const targets = targetsFromWords([
      { text: 'Cancel', confidence: 94, bbox: { x0: 200, y0: 80, x1: 280, y1: 108 } },
      { text: 'Save', confidence: 88, bbox: { x0: 20, y0: 80, x1: 82, y1: 108 } },
    ])
    expect(targets.map(target => [target.id, target.label])).toEqual([[1, 'Save'], [2, 'Cancel']])
  })
  it('marks low confidence output in the spoken phrase', () => {
    expect(targetPhrase({ id: 4, label: 'Visual control — label uncertain', confidence: 35, kind: 'visual', x: 0, y: 0, width: 1, height: 1 })).toContain('Uncertain detection')
  })
  it('keeps a one-pixel OCR line variation together as one actionable phrase', () => {
    expect(phrasesFromWords([
      { text: 'Server', confidence: 95, bbox: { x0: 10, y0: 40, x1: 80, y1: 62 } },
      { text: 'address', confidence: 94, bbox: { x0: 88, y0: 41, x1: 168, y1: 63 } },
    ])[0].text).toBe('Server address')
  })
})
