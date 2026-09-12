import { useEffect, useState } from 'react'
import './App.css'
import GenreSelect from './components/GenreSelect'
import QuoteBoard from './components/QuoteBoard'
import Legend from './components/Legend'
import Controls from './components/Controls'
import SolvedReveal from './components/SolvedReveal'
import DebugPanel from './components/DebugPanel'
import useCryptogram from './hooks/useCryptogram'
import { CATEGORY_LABELS, pickRandomPuzzle } from './data/puzzles'

function Puzzle({ category, onChangeGenre }) {
  const [puzzle, setPuzzle] = useState(() => pickRandomPuzzle(category))
  const game = useCryptogram(puzzle.quote, puzzle.person)
  const [feedback, setFeedback] = useState(null)
  const solved = feedback?.kind === 'correct'

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
      } else if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault()
        game.typeLetter(key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game, solved])

  function handleSubmit() {
    if (!game.isComplete) {
      setFeedback({ kind: 'incomplete', message: 'Fill in every letter before submitting.' })
      return
    }
    setFeedback(
      game.isCorrect
        ? { kind: 'correct', message: 'Solved it - nicely done!' }
        : { kind: 'incorrect', message: 'Not quite right - keep at it.' }
    )
  }

  function handleNewQuote() {
    setFeedback(null)
    setPuzzle((current) => pickRandomPuzzle(category, current.id))
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
          <QuoteBoard
            ciphertext={game.ciphertext}
            guesses={game.guesses}
            selectedPosition={game.selectedPosition}
            selectedCipherLetter={game.selectedCipherLetter}
            onSelectPosition={game.selectPosition}
          />

          <Legend
            ciphertext={game.ciphertext}
            guesses={game.guesses}
            selectedCipherLetter={game.selectedCipherLetter}
            onSelectCipherLetter={game.selectCipherLetter}
          />

          <Controls
            canUndo={game.canUndo}
            onUndo={game.undo}
            onReset={() => { setFeedback(null); game.reset() }}
            onSubmit={handleSubmit}
            feedback={feedback}
          />
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
