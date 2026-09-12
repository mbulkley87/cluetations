import { useEffect, useState } from 'react'
import './App.css'
import GenreSelect from './components/GenreSelect'
import QuoteBoard from './components/QuoteBoard'
import Legend from './components/Legend'
import Controls from './components/Controls'
import AnswerBox from './components/AnswerBox'
import SolvedReveal from './components/SolvedReveal'
import DebugPanel from './components/DebugPanel'
import useCryptogram from './hooks/useCryptogram'
import { CATEGORY_LABELS, pickRandomPuzzle } from './data/puzzles'

function Puzzle({ category, onChangeGenre }) {
  const [puzzle, setPuzzle] = useState(() => pickRandomPuzzle(category))
  const game = useCryptogram(puzzle.quote, puzzle.person)
  const [feedback, setFeedback] = useState(null)
  const [hintMode, setHintMode] = useState(false)
  const solved = feedback?.kind === 'correct'
  // Only ever shown while the decode is CURRENTLY correct - if the player
  // undoes back out of a correct decode after reaching this step, the box
  // disappears until they fix the decode and submit again.
  const showAnswerBox = feedback?.kind !== 'correct' && feedback?.awaitingPerson && game.isCorrect

  useEffect(() => {
    if (solved) return undefined

    function handleKeyDown(event) {
      const key = event.key

      if (key === 'ArrowRight' || key === 'ArrowDown' || key === ' ') {
        event.preventDefault()
        game.moveNext()
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        event.preventDefault()
        game.movePrev()
      } else if (key === 'Backspace' || key === 'Delete') {
        event.preventDefault()
        game.deleteAndMoveBack()
      } else if (key === 'Escape' && hintMode) {
        event.preventDefault()
        setHintMode(false)
      } else if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault()
        game.typeLetter(key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game, solved, hintMode])

  function handleSelectPosition(position) {
    if (hintMode) {
      game.revealHint(game.ciphertext[position])
      setHintMode(false)
      return
    }
    game.selectPosition(position)
  }

  function handleSelectCipherLetter(cipherLetter) {
    if (hintMode) {
      game.revealHint(cipherLetter)
      setHintMode(false)
      return
    }
    game.selectCipherLetter(cipherLetter)
  }

  function handleSubmit() {
    if (!game.isComplete) {
      setFeedback({ kind: 'incomplete', message: 'Fill in every letter before submitting.' })
      return
    }
    if (!game.isCorrect) {
      setFeedback({ kind: 'incorrect', message: 'Not quite right - keep at it.' })
      return
    }
    // Decode is correct - last step is naming the source, which the
    // AnswerBox handles. awaitingPerson isn't a real "kind" (no banner of
    // its own renders for it), just the flag showAnswerBox reads.
    setFeedback({ awaitingPerson: true })
  }

  function handleCheckPersonAnswer(guess) {
    const isRightPerson = guess.trim().toLowerCase() === puzzle.person.trim().toLowerCase()
    setFeedback(
      isRightPerson
        ? { kind: 'correct' }
        : { kind: 'wrong-person', message: "That's not who said it - try again.", awaitingPerson: true }
    )
  }

  function handleNewQuote() {
    setFeedback(null)
    setHintMode(false)
    setPuzzle((current) => pickRandomPuzzle(category, current.id))
  }

  function handleReset() {
    setFeedback(null)
    setHintMode(false)
    game.reset()
  }

  return (
    // Remounting on puzzle change is deliberate - useCryptogram derives its
    // cipher fresh from person/quote, so a new puzzle needs a fresh
    // instance rather than trying to reset an existing one in place.
    <div className="puzzle-screen" key={puzzle.id}>
      <div className="puzzle-header">
        <span className="puzzle-genre">{CATEGORY_LABELS[category]}</span>
        {!solved && (
          <div className="puzzle-header-actions">
            <button type="button" className="text-button" onClick={handleNewQuote}>
              New Quote
            </button>
            <button type="button" className="text-button" onClick={onChangeGenre}>
              Change Genre
            </button>
          </div>
        )}
      </div>

      {solved ? (
        <SolvedReveal
          quote={puzzle.quote}
          person={puzzle.person}
          work={puzzle.work}
          onNewQuote={handleNewQuote}
          onChangeGenre={onChangeGenre}
        />
      ) : (
        <>
          {hintMode && (
            <div className="hint-banner">Which letter do you want? Click any letter to reveal it.</div>
          )}

          <QuoteBoard
            ciphertext={game.ciphertext}
            guesses={game.guesses}
            selectedPosition={game.selectedPosition}
            selectedCipherLetter={game.selectedCipherLetter}
            onSelectPosition={handleSelectPosition}
          />

          <Legend
            ciphertext={game.ciphertext}
            distinctCipherLetters={game.distinctCipherLetters}
            guesses={game.guesses}
            selectedCipherLetter={game.selectedCipherLetter}
            onSelectCipherLetter={handleSelectCipherLetter}
          />

          <Controls
            canUndo={game.canUndo}
            onUndo={game.undo}
            onReset={handleReset}
            onSubmit={handleSubmit}
            onHint={() => setHintMode((current) => !current)}
            hintActive={hintMode}
            feedback={feedback?.kind && feedback.kind !== 'correct' ? feedback : null}
          />

          {showAnswerBox && <AnswerBox onCheck={handleCheckPersonAnswer} />}
        </>
      )}

      {import.meta.env.DEV && <DebugPanel person={puzzle.person} />}
    </div>
  )
}

function App() {
  const [category, setCategory] = useState(null)

  if (!category) {
    return <GenreSelect onChoose={setCategory} />
  }

  return <Puzzle category={category} onChangeGenre={() => setCategory(null)} />
}

export default App
