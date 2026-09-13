import { useCallback, useMemo, useState } from 'react'
import { encryptQuote, buildCipherSequence, buildReverseCipherAlphabet, isLetter } from '../utils/cipher'

// One playthrough of a single puzzle: the plaintext, its cipher (derived
// from the person's name - see src/utils/cipher.js), and every piece of
// state a player can change while solving it (guesses, which tile is
// selected, and an undo history of past guess states).
function useCryptogram(plaintext, person) {
  const ciphertext = useMemo(() => encryptQuote(plaintext, person), [plaintext, person])
  const upperPlaintext = useMemo(() => plaintext.toUpperCase(), [plaintext])
  const reverseCipher = useMemo(() => buildReverseCipherAlphabet(person), [person])

  // All 26 cipher letters, in the exact order the legend displays them -
  // the person's own unique letters first, then the reverse-alphabet
  // leftovers (see buildCipherSequence). Most of these won't actually
  // appear in a short quote, which is exactly why legend-mode navigation
  // can't just be "positions in the quote" - see navigationMode below.
  const cipherSequence = useMemo(() => buildCipherSequence(person), [person])

  // Every character index that's an actual letter (spaces/punctuation are
  // shown as-is and never selectable) - this is the order arrow keys/space
  // step through in "quote" navigation mode.
  const letterPositions = useMemo(
    () => ciphertext.split('').map((char, index) => (isLetter(char) ? index : null)).filter((index) => index !== null),
    [ciphertext]
  )

  const [guesses, setGuesses] = useState({}) // cipherLetter -> guessed plaintext letter
  const [history, setHistory] = useState([]) // stack of previous guesses snapshots, for undo

  // Quote-mode selection is a POSITION (so repeated letters in the quote
  // are each their own stop while stepping through it). Legend-mode
  // selection is a CIPHER LETTER directly, since most of the legend's 26
  // entries have no position in the quote at all. navigationMode says
  // which one is currently "live" - whichever area was last clicked.
  const [selectedPosition, setSelectedPosition] = useState(letterPositions[0] ?? null)
  const [selectedLegendLetter, setSelectedLegendLetter] = useState(null)
  const [navigationMode, setNavigationMode] = useState('quote') // 'quote' | 'legend'

  const selectedCipherLetter = navigationMode === 'legend'
    ? selectedLegendLetter
    : (selectedPosition === null ? null : ciphertext[selectedPosition])

  // Which quote tile (if any) gets the solid "you clicked exactly this
  // one" highlight - in legend mode that's the selected letter's first
  // appearance in the quote, or none at all if it doesn't appear there.
  const highlightPosition = navigationMode === 'legend'
    ? (selectedLegendLetter === null ? null : ciphertext.indexOf(selectedLegendLetter))
    : selectedPosition

  const pushHistory = useCallback(() => {
    setHistory((current) => [...current, guesses])
  }, [guesses])

  const selectPosition = useCallback((position) => {
    setNavigationMode('quote')
    setSelectedPosition(position)
  }, [])

  const selectCipherLetter = useCallback((cipherLetter) => {
    setNavigationMode('legend')
    setSelectedLegendLetter(cipherLetter)
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

  // Reveals the true answer for one cipher letter (the "Gimme" feature) -
  // routed through setGuess so it's undo-able and still respects the
  // one-to-one constraint like any other guess.
  const revealHint = useCallback((cipherLetter) => {
    const correctPlainLetter = reverseCipher[cipherLetter]
    if (correctPlainLetter) setGuess(cipherLetter, correctPlainLetter)
  }, [reverseCipher, setGuess])

  const moveBy = useCallback((delta) => {
    if (navigationMode === 'legend') {
      setSelectedLegendLetter((current) => {
        const currentIndex = cipherSequence.indexOf(current)
        const baseIndex = currentIndex === -1 ? 0 : currentIndex
        const nextIndex = Math.min(Math.max(baseIndex + delta, 0), cipherSequence.length - 1)
        return cipherSequence[nextIndex]
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
  }, [navigationMode, cipherSequence, letterPositions])

  const moveNext = useCallback(() => moveBy(1), [moveBy])
  const movePrev = useCallback(() => moveBy(-1), [moveBy])

  const typeLetter = useCallback((plainLetter) => {
    if (selectedCipherLetter === null) return
    setGuess(selectedCipherLetter, plainLetter)
    moveNext()
  }, [selectedCipherLetter, setGuess, moveNext])

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
    setGuesses({})
    setSelectedPosition(letterPositions[0] ?? null)
    setSelectedLegendLetter(null)
    setNavigationMode('quote')
  }, [letterPositions])

  // What the player has built so far, letter by letter - used both to
  // render the quote and to check the answer on submit.
  const guessedText = useMemo(
    () => ciphertext.split('').map((char) => (isLetter(char) ? (guesses[char] || '') : char)).join(''),
    [ciphertext, guesses]
  )

  const isComplete = useMemo(
    () => letterPositions.every((position) => Boolean(guesses[ciphertext[position]])),
    [letterPositions, guesses, ciphertext]
  )

  // Case is ignored deliberately - both sides are already uppercased, this
  // just documents that submit is a case-insensitive comparison per spec.
  const isCorrect = useMemo(() => guessedText === upperPlaintext, [guessedText, upperPlaintext])

  // "Am I on the right track?" only judges what's actually been filled in -
  // unguessed letters don't count against you, only wrong ones do.
  const isOnTrack = useMemo(
    () => Object.entries(guesses).every(([cipherLetter, plainLetter]) => reverseCipher[cipherLetter] === plainLetter),
    [guesses, reverseCipher]
  )

  return {
    plaintext: upperPlaintext,
    ciphertext,
    letterPositions,
    cipherSequence,
    guesses,
    guessedText,
    selectedPosition: highlightPosition,
    selectedCipherLetter,
    canUndo: history.length > 0,
    isComplete,
    isCorrect,
    isOnTrack,
    hasGuesses: Object.keys(guesses).length > 0,
    selectPosition,
    selectCipherLetter,
    typeLetter,
    deleteAndMoveBack,
    revealHint,
    moveNext,
    movePrev,
    undo,
    reset,
  }
}

export default useCryptogram
