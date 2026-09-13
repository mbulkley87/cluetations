import { useEffect, useState } from 'react'
import './App.css'
import GenreSelect from './components/GenreSelect'
import QuoteBoard from './components/QuoteBoard'
import Legend from './components/Legend'
import Keyboard from './components/Keyboard'
import Controls from './components/Controls'
import AnswerBox from './components/AnswerBox'
import SolvedReveal from './components/SolvedReveal'
import DebugPanel from './components/DebugPanel'
import useCryptogram from './hooks/useCryptogram'
import { normalizePersonName } from './utils/cipher'
import { CATEGORY_LABELS, pickRandomPuzzle } from './data/puzzles'

// Picks which puzzle is active and owns nothing else - PuzzleGame below is
// given `key={puzzle.id}`, which is what actually matters here: a changed
// key tells React this is a genuinely new component instance, so it
// unmounts the old one (discarding useCryptogram's guesses/history/
// selection state, and PuzzleGame's own feedback/gimmeMode/reveal state)
// and mounts a fresh one, instead of reusing the old instance in place
// with stale state left over from the previous quote.
function Puzzle({ category, difficulty, onChangeGenre }) {
  const [puzzle, setPuzzle] = useState(() => pickRandomPuzzle(category, null, difficulty))

  function handleNewQuote() {
    setPuzzle((current) => pickRandomPuzzle(category, current.id, difficulty))
  }

  return (
    <PuzzleGame
      key={puzzle.id}
      puzzle={puzzle}
      category={category}
      onNewQuote={handleNewQuote}
      onChangeGenre={onChangeGenre}
    />
  )
}

function PuzzleGame({ puzzle, category, onNewQuote, onChangeGenre }) {
  const game = useCryptogram(puzzle.quote, puzzle.person)
  const [feedback, setFeedback] = useState(null)
  const [gimmeMode, setGimmeMode] = useState(false)
  const [yearRevealed, setYearRevealed] = useState(false)
  const [hintRevealed, setHintRevealed] = useState(false)
  const solved = feedback?.kind === 'correct'
  // Only ever shown while the decode is CURRENTLY correct - if the player
  // undoes back out of a correct decode after reaching this step, the box
  // disappears until they fix the decode and submit again.
  const showAnswerBox = feedback?.kind !== 'correct' && feedback?.awaitingPerson && game.isCorrect

  useEffect(() => {
    if (solved) return undefined

    function handleKeyDown(event) {
      // A focused text field (the AnswerBox input) handles its own typing -
      // without this guard, preventDefault() below blocks characters from
      // ever reaching it while simultaneously overwriting quote/legend
      // guesses as if the player were still typing into the puzzle.
      const targetTag = event.target?.tagName
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return

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
      } else if (key === 'Escape' && gimmeMode) {
        event.preventDefault()
        setGimmeMode(false)
      } else if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault()
        game.typeLetter(key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game, solved, gimmeMode])

  function handleSelectPosition(position) {
    if (gimmeMode) {
      game.revealHint(game.ciphertext[position])
      setGimmeMode(false)
      return
    }
    game.selectPosition(position)
  }

  function handleSelectLegendLetter(plainLetter) {
    if (gimmeMode) {
      game.revealPlainLetter(plainLetter)
      setGimmeMode(false)
      return
    }
    game.selectLegendLetter(plainLetter)
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
    // Compare on letters only (case/spacing/punctuation-insensitive) so
    // "JRR Tolkien", "j.r.r. tolkien", and "J. R. R. Tolkien" all match
    // "J.R.R. Tolkien" - the player shouldn't have to reproduce the exact
    // source string, just name the right person. Reuses the same
    // normalization the cipher itself is built from, since it already
    // strips exactly this kind of formatting noise down to bare letters.
    const isRightPerson = normalizePersonName(guess) === normalizePersonName(puzzle.person)
    setFeedback(
      isRightPerson
        ? { kind: 'correct' }
        : { kind: 'wrong-person', message: "That's not who said it - try again.", awaitingPerson: true }
    )
  }

  function handleCheckTrack() {
    // Only judges guesses actually made so far - unfilled letters never
    // count against the player, only wrong ones do. Deliberately just two
    // possible messages per spec, nothing more granular.
    setFeedback(
      game.isOnTrack
        ? { kind: 'track-good', message: 'All good!' }
        : { kind: 'track-off', message: 'Might want to revisit some things.' }
    )
  }

  function handleReset() {
    setFeedback(null)
    setGimmeMode(false)
    setYearRevealed(false)
    setHintRevealed(false)
    game.reset()
  }

  return (
    <div className="puzzle-screen">
      <div className="puzzle-header">
        <span className="puzzle-genre">{CATEGORY_LABELS[category]}</span>
        {!solved && (
          <div className="puzzle-header-actions">
            <button type="button" className="text-button" onClick={onNewQuote}>
              New Quote
            </button>
            <button type="button" className="text-button" onClick={onChangeGenre}>
              Change Genre
            </button>
          </div>
        )}
      </div>

      {!solved && (
        <div className="info-toolbar">
          <div className="info-toolbar-item">
            <button
              type="button"
              className="control-button"
              onClick={() => setYearRevealed(true)}
              disabled={yearRevealed}
            >
              📅 Year
            </button>
            <span className="info-toolbar-value">{yearRevealed ? puzzle.year : '—'}</span>
          </div>
          <div className="info-toolbar-item">
            <button
              type="button"
              className="control-button"
              onClick={() => setHintRevealed(true)}
              disabled={hintRevealed}
            >
              📖 Hint
            </button>
            <span className="info-toolbar-value">{hintRevealed ? puzzle.hint : '—'}</span>
          </div>
        </div>
      )}

      {solved ? (
        <SolvedReveal
          quote={puzzle.quote}
          person={puzzle.person}
          work={puzzle.work}
          year={puzzle.year}
          onNewQuote={onNewQuote}
          onChangeGenre={onChangeGenre}
        />
      ) : (
        <>
          <QuoteBoard
            ciphertext={game.ciphertext}
            guesses={game.guesses}
            selectedPosition={game.selectedPosition}
            selectedCipherLetter={game.selectedCipherLetter}
            onSelectPosition={handleSelectPosition}
          />

          <Legend
            ciphertext={game.ciphertext}
            plainToCipher={game.plainToCipher}
            selectedPlainLetter={game.selectedPlainLetter}
            onSelectPlainLetter={handleSelectLegendLetter}
          />

          <Keyboard onType={game.typeLetter} onDelete={game.deleteAndMoveBack} />

          <Controls
            canUndo={game.canUndo}
            onUndo={game.undo}
            onReset={handleReset}
            onSubmit={handleSubmit}
            onGimme={() => setGimmeMode((current) => !current)}
            gimmeActive={gimmeMode}
            onCheckTrack={handleCheckTrack}
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
  const [selection, setSelection] = useState(null)

  if (!selection) {
    return <GenreSelect onChoose={(category, difficulty) => setSelection({ category, difficulty })} />
  }

  return (
    <Puzzle
      category={selection.category}
      difficulty={selection.difficulty}
      onChangeGenre={() => setSelection(null)}
    />
  )
}

export default App
