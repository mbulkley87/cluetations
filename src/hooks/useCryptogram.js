import { useCallback, useMemo, useState } from 'react'
import { generateCipher, encode, isLetter } from '../utils/cipher'

// One playthrough of a single quote: the plaintext, its cipher, and every
// piece of state a player can change while solving it (guesses, which tile
// is selected, and an undo history of past guess states).
function useCryptogram(plaintext) {
  const [cipher] = useState(() => generateCipher())
  const ciphertext = useMemo(() => encode(plaintext, cipher), [plaintext, cipher])
  const upperPlaintext = useMemo(() => plaintext.toUpperCase(), [plaintext])

  // Every character index that's an actual letter (spaces/punctuation are
  // shown as-is and never selectable) - this is the order arrow keys/space
  // step through.
  const letterPositions = useMemo(
    () => ciphertext.split('').map((char, index) => (isLetter(char) ? index : null)).filter((index) => index !== null),
    [ciphertext]
  )

  const [guesses, setGuesses] = useState({}) // cipherLetter -> guessed plaintext letter
  const [history, setHistory] = useState([]) // stack of previous guesses snapshots, for undo
  const [selectedPosition, setSelectedPosition] = useState(letterPositions[0] ?? null)

  const selectedCipherLetter = selectedPosition === null ? null : ciphertext[selectedPosition]

  const pushHistory = useCallback(() => {
    setHistory((current) => [...current, guesses])
  }, [guesses])

  const selectPosition = useCallback((position) => {
    setSelectedPosition(position)
  }, [])

  // Selecting straight from the legend (no specific quote tile was clicked)
  // still needs a tile to show as the "primary" highlight - the letter's
  // first appearance in the quote reads as the natural anchor.
  const selectCipherLetter = useCallback((cipherLetter) => {
    const firstIndex = ciphertext.indexOf(cipherLetter)
    if (firstIndex !== -1) setSelectedPosition(firstIndex)
  }, [ciphertext])

  const setGuess = useCallback((cipherLetter, plainLetter) => {
    pushHistory()
    setGuesses((current) => ({ ...current, [cipherLetter]: plainLetter }))
  }, [pushHistory])

  const clearGuess = useCallback((cipherLetter) => {
    pushHistory()
    setGuesses((current) => {
      const next = { ...current }
      delete next[cipherLetter]
      return next
    })
  }, [pushHistory])

  const moveBy = useCallback((delta) => {
    setSelectedPosition((current) => {
      const currentIndex = letterPositions.indexOf(current)
      if (currentIndex === -1) return letterPositions[0] ?? null
      const nextIndex = currentIndex + delta
      if (nextIndex < 0) return letterPositions[0] ?? null
      if (nextIndex >= letterPositions.length) return letterPositions[letterPositions.length - 1] ?? null
      return letterPositions[nextIndex]
    })
  }, [letterPositions])

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

  const isCorrect = useMemo(() => guessedText === upperPlaintext, [guessedText, upperPlaintext])

  return {
    plaintext: upperPlaintext,
    ciphertext,
    letterPositions,
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
    moveNext,
    movePrev,
    undo,
    reset,
  }
}

export default useCryptogram
