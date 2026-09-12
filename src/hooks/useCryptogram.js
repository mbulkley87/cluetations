import { useCallback, useMemo, useState } from 'react'
import { encryptQuote, buildReverseCipherAlphabet, isLetter } from '../utils/cipher'

// One playthrough of a single puzzle: the plaintext, its cipher (derived
// from the person's name - see src/utils/cipher.js), and every piece of
// state a player can change while solving it (guesses, which tile is
// selected, and an undo history of past guess states).
function useCryptogram(plaintext, person) {
  const ciphertext = useMemo(() => encryptQuote(plaintext, person), [plaintext, person])
  const upperPlaintext = useMemo(() => plaintext.toUpperCase(), [plaintext])
  const reverseCipher = useMemo(() => buildReverseCipherAlphabet(person), [person])

  // Every character index that's an actual letter (spaces/punctuation are
  // shown as-is and never selectable) - this is the order arrow keys/space
  // step through in "quote" navigation mode.
  const letterPositions = useMemo(
    () => ciphertext.split('').map((char, index) => (isLetter(char) ? index : null)).filter((index) => index !== null),
    [ciphertext]
  )

  // Every distinct cipher letter actually used in this puzzle, alphabetical -
  // the legend's own display order, and what arrow keys step through in
  // "legend" navigation mode.
  const distinctCipherLetters = useMemo(() => {
    const seen = new Set()
    for (const char of ciphertext) {
      if (isLetter(char)) seen.add(char)
    }
    return [...seen].sort()
  }, [ciphertext])

  const [guesses, setGuesses] = useState({}) // cipherLetter -> guessed plaintext letter
  const [history, setHistory] = useState([]) // stack of previous guesses snapshots, for undo
  const [selectedPosition, setSelectedPosition] = useState(letterPositions[0] ?? null)
  // Which sequence arrow keys/space/delete step through - set by whichever
  // area (quote board or legend) was last clicked, so navigation always
  // continues in that same area instead of jumping back to quote positions
  // after a legend click.
  const [navigationMode, setNavigationMode] = useState('quote') // 'quote' | 'legend'

  const selectedCipherLetter = selectedPosition === null ? null : ciphertext[selectedPosition]

  const pushHistory = useCallback(() => {
    setHistory((current) => [...current, guesses])
  }, [guesses])

  const selectPosition = useCallback((position) => {
    setNavigationMode('quote')
    setSelectedPosition(position)
  }, [])

  // Selecting from the legend still needs a tile to show as the "primary"
  // highlight in the quote - the letter's first appearance reads as the
  // natural anchor - but subsequent navigation stays within the legend's
  // own letter sequence (see navigationMode).
  const selectCipherLetter = useCallback((cipherLetter) => {
    setNavigationMode('legend')
    const firstIndex = ciphertext.indexOf(cipherLetter)
    if (firstIndex !== -1) setSelectedPosition(firstIndex)
  }, [ciphertext])

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

  // Reveals the true answer for one cipher letter (the hint feature) -
  // routed through setGuess so it's undo-able and still respects the
  // one-to-one constraint like any other guess.
  const revealHint = useCallback((cipherLetter) => {
    const correctPlainLetter = reverseCipher[cipherLetter]
    if (correctPlainLetter) setGuess(cipherLetter, correctPlainLetter)
  }, [reverseCipher, setGuess])

  const moveBy = useCallback((delta) => {
    if (navigationMode === 'legend') {
      setSelectedPosition((current) => {
        const currentCipherLetter = current === null ? null : ciphertext[current]
        const currentIndex = distinctCipherLetters.indexOf(currentCipherLetter)
        const baseIndex = currentIndex === -1 ? 0 : currentIndex
        const nextIndex = Math.min(Math.max(baseIndex + delta, 0), distinctCipherLetters.length - 1)
        const nextCipherLetter = distinctCipherLetters[nextIndex]
        const firstIndexInQuote = ciphertext.indexOf(nextCipherLetter)
        return firstIndexInQuote === -1 ? current : firstIndexInQuote
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
  }, [navigationMode, distinctCipherLetters, ciphertext, letterPositions])

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

  return {
    plaintext: upperPlaintext,
    ciphertext,
    letterPositions,
    distinctCipherLetters,
    guesses,
    guessedText,
    selectedPosition,
    selectedCipherLetter,
    canUndo: history.length > 0,
    isComplete,
    isCorrect,
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
