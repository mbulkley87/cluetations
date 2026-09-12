import { describe, expect, test } from 'vitest'
import { normalizePersonName, buildCipherAlphabet, encryptQuote } from './cipher'

describe('normalizePersonName', () => {
  test('uppercases and strips spaces', () => {
    expect(normalizePersonName('Dolly Parton')).toBe('DOLLYPARTON')
  })

  test('strips periods and spaces from initials', () => {
    expect(normalizePersonName('J.R.R. Tolkien')).toBe('JRRTOLKIEN')
  })

  test('strips periods from abbreviations like Jr.', () => {
    expect(normalizePersonName('Martin Luther King Jr.')).toBe('MARTINLUTHERKINGJR')
  })

  test('strips apostrophes and hyphens', () => {
    expect(normalizePersonName("O'Connor-Smith")).toBe('OCONNORSMITH')
  })
})

describe('buildCipherAlphabet - worked example from spec (Dolly Parton)', () => {
  const cipher = buildCipherAlphabet('Dolly Parton')

  test('matches the exact published mapping character-for-character', () => {
    const expected = {
      A: 'D', B: 'O', C: 'L', D: 'Y', E: 'P', F: 'A', G: 'R', H: 'T', I: 'N',
      J: 'Z', K: 'X', L: 'W', M: 'V', N: 'U', O: 'S', P: 'Q', Q: 'M', R: 'K',
      S: 'J', T: 'I', U: 'H', V: 'G', W: 'F', X: 'E', Y: 'C', Z: 'B',
    }
    expect(cipher).toEqual(expected)
  })

  test('encrypts "NINE TO FIVE" to "UNUP IS ANGP"', () => {
    expect(encryptQuote('NINE TO FIVE', 'Dolly Parton')).toBe('UNUP IS ANGP')
  })
})

describe('buildCipherAlphabet - general properties', () => {
  const names = [
    'Dolly Parton',
    'J.R.R. Tolkien',
    "O'Connor-Smith",
    'Martin Luther King Jr.',
    'A',
    'ZYXWVUTSRQPONMLKJIHGFEDCBA',
  ]

  test.each(names)('produces a full 1:1 permutation of A-Z for "%s"', (name) => {
    const cipher = buildCipherAlphabet(name)
    const values = Object.values(cipher)
    expect(Object.keys(cipher).sort()).toEqual('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort())
    expect(new Set(values).size).toBe(26)
  })

  test('is deterministic - same name always produces the same cipher', () => {
    expect(buildCipherAlphabet('Tom Hanks')).toEqual(buildCipherAlphabet('Tom Hanks'))
    expect(buildCipherAlphabet('Tom Hanks')).toEqual(buildCipherAlphabet('TOM HANKS'))
  })
})

describe('encryptQuote', () => {
  test('preserves spaces, apostrophes, and punctuation, only substituting letters', () => {
    const result = encryptQuote("I'm here!", 'Dolly Parton')
    expect(result).toMatch(/^[A-Z]'[A-Z] [A-Z]{4}!$/)
    expect(result.includes("'")).toBe(true)
    expect(result.includes('!')).toBe(true)
    expect(result.includes(' ')).toBe(true)
  })
})
