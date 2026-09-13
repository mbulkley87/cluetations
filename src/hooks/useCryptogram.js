import { useCallback, useMemo, useState } from 'react'
import { encryptQuote, buildCipherAlphabet, buildReverseCipherAlphabet, normalizePersonName, isLetter, ALPHABET } from '../utils/cipher'

// One playthrough of a single puzzle: the plaintext, its cipher (derived
// from the person's name - see src/utils/cipher.js), and every piece of
// state a player can change while solving it (guesses, which tile is
// selected, and an undo history of past guess states).
//
// guesses is always stored cipherLetter -> guessed plaintext letter, since
// that's what the quote board needs (it shows cipher letters and the
// player fills in plain-letter guesses). The Legend is the mirror image of
// that same data: it's indexed by the PLAIN alphabet A-Z (fixed, always
// visible - not secret) and shows whichever cipher letter the player has
// resolved for each, which is exactly plainToCipher below, computed by
// inverting guesses. Selecting a Legend cell and typing a letter still
// writes into the same guesses map, just entering the cipher-letter side
// of the pair instead of the plain-letter side - see typeLetter.
function useCryptogram(plaintext, person) {
  const ciphertext = useMemo(() => encryptQuote(plaintext, person), [plaintext, person])
  const forwardCipher = useMemo(() => buildCipherAlphabet(person), [person])
  const reverseCipher = useMemo(() => buildReverseCipherAlphabet(person), [person])

  // Every character index that's an actual letter (spaces/punctuation are
  // shown as-is and never selectable) - this is the order arrow keys/space
  // step through in "quote" navigation mode.
  const letterPositions = useMemo(
    () => ciphertext.split('').map((char, index) => (isLetter(char) ? index : null)).filter((index) => index !== null),
    [ciphertext]
  )

  // Some of the person's own name letters can end up with no way to ever
  // be discovered from context: their cipher letter simply never appears
  // anywhere in this particular quote's ciphertext (the quote just
  // doesn't happen to use that plain letter). That's not "not solved
  // yet" - it's genuinely unreachable, since there's no tile anywhere to
  // find it from. Rather than leave a permanent gap in the Legend's
  // "spells the name" payoff, those specific letters start pre-solved.
  // Letters outside the name (the mechanical reverse-alphabet tail) are
  // left alone even if unreachable - only the name's own letters matter
  // for that payoff. This is the puzzle's actual starting state, so
  // `reset` restores it too, rather than clearing to a truly empty map.
  const initialGuesses = useMemo(() => {
    const nameLetterCount = new Set(normalizePersonName(person)).size
    const initial = {}
    for (let i = 0; i < nameLetterCount; i++) {
      const plainLetter = ALPHABET[i]
      const cipherLetter = forwardCipher[plainLetter]
      if (!ciphertext.includes(cipherLetter)) {
        initial[cipherLetter] = plainLetter
      }
    }
    return initial
  }, [person, forwardCipher, ciphertext])

  const [guesses, setGuesses] = useState(initialGuesses) // cipherLetter -> guessed plaintext letter
  const [history, setHistory] = useState([]) // stack of previous guesses snapshots, for undo

  // Quote-mode selection is a POSITION (so repeated letters in the quote
  // are each their own stop while stepping through it). Legend-mode
  // selection is a PLAIN letter (the Legend's fixed A-Z index). navigationMode
  // says which one is currently "live" - whichever area was last clicked.
  const [selectedPosition, setSelectedPosition] = useState(letterPositions[0] ?? null)
  const [selectedLegendLetter, setSelectedLegendLetter] = useState(null)
  const [navigationMode, setNavigationMode] = useState('quote') // 'quote' | 'legend'

  // guesses inverted (plainLetter -> cipherLetter) - what the Legend
  // displays per cell, and only ever contains letters the player has
  // actually resolved (never leaks anything unsolved).
  const plainToCipher = useMemo(() => {
    const map = {}
    for (const [cipherLetter, plainLetter] of Object.entries(guesses)) {
      map[plainLetter] = cipherLetter
    }
    return map
  }, [guesses])

  // The cipher letter "in play" for whichever cell is currently selected -
  // in quote mode that's just the ciphertext character under the cursor;
  // in legend mode it's whatever cipher letter (if any) has been resolved
  // for the selected plain letter. This is what drives the quote board's
  // "highlight every tile sharing this letter" effect either way.
  const selectedCipherLetter = navigationMode === 'legend'
    ? (selectedLegendLetter === null ? null : (plainToCipher[selectedLegendLetter] ?? null))
    : (selectedPosition === null ? null : ciphertext[selectedPosition])

  // Which Legend cell (if any) should show the "you clicked exactly this
  // one" highlight - in quote mode that's whichever plain letter the
  // selected cipher letter currently resolves to (nothing, if unsolved).
  const highlightedPlainLetter = navigationMode === 'legend'
    ? selectedLegendLetter
    : (selectedCipherLetter === null ? null : (guesses[selectedCipherLetter] ?? null))

  // Which quote tile (if any) gets the solid "you clicked exactly this
  // one" highlight - in legend mode that's the resolved cipher letter's
  // first appearance in the quote, or none if it isn't resolved yet.
  const highlightPosition = navigationMode === 'legend'
    ? (selectedCipherLetter === null ? null : ciphertext.indexOf(selectedCipherLetter))
    : selectedPosition

  const pushHistory = useCallback(() => {
    setHistory((current) => [...current, guesses])
  }, [guesses])

  const selectPosition = useCallback((position) => {
    setNavigationMode('quote')
    setSelectedPosition(position)
  }, [])

  const selectLegendLetter = useCallback((plainLetter) => {
    setNavigationMode('legend')
    setSelectedLegendLetter(plainLetter)
  }, [])

  // A substitution must stay one-to-one: assigning a plaintext letter to a
  // cipher letter silently drops that same plaintext letter from whichever
  // other cipher letter it was previously attached to, so two cipher
  // letters are never simultaneously decoded as the same guess. Both the
  // new assignment and the collision cleanup count as a single undo step.
  const setGuess = useCallback((cipherLetter, plainLetter) => {
    pushHistory()
    setGuesses((current) => {
      const next = {}
      for (const [existingCipherLetter, existingPlainLetter] of Object.entries(current)) {
        if (existingPlainLetter === plainLetter && existingCipherLetter !== cipherLetter) continue
        next[existingCipherLetter] = existingPlainLetter
      }
      next[cipherLetter] = plainLetter
      return next
    })
  }, [pushHistory])

  const clearGuess = useCallback((cipherLetter) => {
    pushHistory()
    setGuesses((current) => {
      const next = { ...current }
      delete next[cipherLetter]
      return next
    })
  }, [pushHistory])

  // Reveals the true plain letter for one cipher letter (the "Gimme"
  // feature, used from the quote board) - routed through setGuess so it's
  // undo-able and still respects the one-to-one constraint.
  const revealHint = useCallback((cipherLetter) => {
    const correctPlainLetter = reverseCipher[cipherLetter]
    if (correctPlainLetter) setGuess(cipherLetter, correctPlainLetter)
  }, [reverseCipher, setGuess])

  // The mirror of revealHint, for Gimme used from the Legend: reveals the
  // true cipher letter for one plain letter.
  const revealPlainLetter = useCallback((plainLetter) => {
    const correctCipherLetter = forwardCipher[plainLetter]
    if (correctCipherLetter) setGuess(correctCipherLetter, plainLetter)
  }, [forwardCipher, setGuess])

  const moveBy = useCallback((delta) => {
    if (navigationMode === 'legend') {
      setSelectedLegendLetter((current) => {
        const currentIndex = ALPHABET.indexOf(current)
        const baseIndex = currentIndex === -1 ? 0 : currentIndex
        const nextIndex = Math.min(Math.max(baseIndex + delta, 0), ALPHABET.length - 1)
        return ALPHABET[nextIndex]
      })
      return
    }

    setSelectedPosition((current) => {
      const currentIndex = letterPositions.indexOf(current)
      if (currentIndex === -1) return letterPositions[0] ?? null
      const nextIndex = currentIndex + delta
      if (nextIndex < 0) return letterPositions[0] ?? null
      if (nextIndex >= letterPositions.length) return letterPositions[letterPositions.length - 1] ?? null
      return letterPositions[nextIndex]
    })
  }, [navigationMode, letterPositions])

  const moveNext = useCallback(() => moveBy(1), [moveBy])
  const movePrev = useCallback(() => moveBy(-1), [moveBy])

  // Typing a letter advances to the next EMPTY box, not just the next one -
  // otherwise stepping past a letter that's already been solved means
  // retyping over it instead of moving on. nextGuesses is computed directly
  // from the `guesses` closure value (not read back out of the setGuesses
  // updater's `current` param) - React does not guarantee that updater
  // runs synchronously, so a value assigned inside it can still be
  // undefined immediately after the call. Computing it here instead is
  // fully deterministic; `guesses` is in the dependency array so this
  // never reads a stale value.
  //
  // The two modes type in OPPOSITE directions: in quote mode the typed key
  // is a PLAIN letter guess for the fixed cipher letter under the cursor;
  // in legend mode the typed key is a CIPHER letter for the fixed plain
  // letter selected in the Legend. Both ultimately produce the same shape
  // of (cipherLetter -> plainLetter) map either way.
  const typeLetter = useCallback((typedLetter) => {
    if (navigationMode === 'legend') {
      if (selectedLegendLetter === null) return

      const nextGuesses = {}
      for (const [existingCipherLetter, existingPlainLetter] of Object.entries(guesses)) {
        if (existingPlainLetter === selectedLegendLetter && existingCipherLetter !== typedLetter) continue
        nextGuesses[existingCipherLetter] = existingPlainLetter
      }
      nextGuesses[typedLetter] = selectedLegendLetter

      pushHistory()
      setGuesses(nextGuesses)

      const resolvedPlainLetters = new Set(Object.values(nextGuesses))
      setSelectedLegendLetter((current) => {
        const currentIndex = ALPHABET.indexOf(current)
        const baseIndex = currentIndex === -1 ? 0 : currentIndex
        for (let i = baseIndex + 1; i < ALPHABET.length; i++) {
          if (!resolvedPlainLetters.has(ALPHABET[i])) return ALPHABET[i]
        }
        return ALPHABET[ALPHABET.length - 1]
      })
      return
    }

    if (selectedCipherLetter === null) return

    const nextGuesses = {}
    for (const [existingCipherLetter, existingPlainLetter] of Object.entries(guesses)) {
      if (existingPlainLetter === typedLetter && existingCipherLetter !== selectedCipherLetter) continue
      nextGuesses[existingCipherLetter] = existingPlainLetter
    }
    nextGuesses[selectedCipherLetter] = typedLetter

    pushHistory()
    setGuesses(nextGuesses)

    setSelectedPosition((current) => {
      const currentIndex = letterPositions.indexOf(current)
      const baseIndex = currentIndex === -1 ? 0 : currentIndex
      for (let i = baseIndex + 1; i < letterPositions.length; i++) {
        const position = letterPositions[i]
        if (!nextGuesses[ciphertext[position]]) return position
      }
      return letterPositions[letterPositions.length - 1] ?? null
    })
  }, [navigationMode, selectedLegendLetter, selectedCipherLetter, guesses, pushHistory, letterPositions, ciphertext])

  const deleteAndMoveBack = useCallback(() => {
    if (selectedCipherLetter !== null) {
      clearGuess(selectedCipherLetter)
    }
    movePrev()
  }, [selectedCipherLetter, clearGuess, movePrev])

  const undo = useCallback(() => {
    setHistory((current) => {
      if (!current.length) return current
      const previous = current[current.length - 1]
      setGuesses(previous)
      return current.slice(0, -1)
    })
  }, [])

  const reset = useCallback(() => {
    setHistory([])
    setGuesses(initialGuesses)
    setSelectedPosition(letterPositions[0] ?? null)
    setSelectedLegendLetter(null)
    setNavigationMode('quote')
  }, [initialGuesses, letterPositions])

  // "Am I on the right track?" only judges what's actually been filled in -
  // unguessed letters don't count against you, only wrong ones do.
  const isOnTrack = useMemo(
    () => Object.entries(guesses).every(([cipherLetter, plainLetter]) => reverseCipher[cipherLetter] === plainLetter),
    [guesses, reverseCipher]
  )

  // Whether the cipher itself is fully and correctly decoded - purely
  // reactive (no Submit button drives this anymore), watched by the UI to
  // trigger the "cipher cracked" celebration. Naming the person is the
  // actual win condition; this just marks the earlier milestone.
  const isCipherSolved = useMemo(() => {
    const guessedText = ciphertext.split('').map((char) => (isLetter(char) ? (guesses[char] || '') : char)).join('')
    return guessedText === plaintext.toUpperCase()
  }, [ciphertext, guesses, plaintext])

  return {
    ciphertext,
    letterPositions,
    guesses,
    plainToCipher,
    selectedPosition: highlightPosition,
    selectedCipherLetter,
    selectedPlainLetter: highlightedPlainLetter,
    canUndo: history.length > 0,
    isOnTrack,
    isCipherSolved,
    hasGuesses: Object.keys(guesses).length > 0,
    selectPosition,
    selectLegendLetter,
    typeLetter,
    deleteAndMoveBack,
    revealHint,
    revealPlainLetter,
    moveNext,
    movePrev,
    undo,
    reset,
  }
}

export default useCryptogram
