import { useEffect, useRef, useState } from 'react'
import './App.css'
import GenreSelect from './components/GenreSelect'
import QuoteBoard from './components/QuoteBoard'
import Legend from './components/Legend'
import Controls from './components/Controls'
import AnswerBox from './components/AnswerBox'
import SolvedReveal from './components/SolvedReveal'
import DebugPanel from './components/DebugPanel'
import useCryptogram from './hooks/useCryptogram'
import { normalizePersonName } from './utils/cipher'
import { triggerHaptic } from './utils/haptics'
import { CATEGORY_LABELS, pickRandomPuzzle } from './data/puzzles'

const CONFETTI = ['🎉', '✨', '🎊', '⭐', '✨', '🎉', '⭐', '🎊', '✨', '🎉', '⭐', '🎊']

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
  const [justCracked, setJustCracked] = useState(false)
  const wasCipherSolvedRef = useRef(false)
  const hiddenInputRef = useRef(null)
  const solved = feedback?.kind === 'correct'

  // A physical keyboard's keydown events are the only way this game ever
  // accepted letters before - fine on desktop, but tapping a <button> on a
  // phone never summons the OS keyboard. This hidden text input is kept
  // focused whenever a tile/legend cell is selected, so tapping one now
  // brings up the real mobile keyboard; typing into it drives the same
  // typeLetter the old on-screen keyboard did. It's positioned off-screen
  // (not display:none - that would block focus/the keyboard entirely).
  useEffect(() => {
    if (!solved) hiddenInputRef.current?.focus()
  }, [solved])

  // Letters are read from the hidden input's own `input` event rather than
  // keydown, since mobile virtual keyboards don't reliably fire proper
  // keydown.key values for letters (autocorrect/predictive text/IME
  // composition) - `input` always reflects what actually landed in the
  // field regardless of how it got typed, on both mobile and desktop.
  function handleHiddenInputChange(event) {
    const typed = event.target.value
    event.target.value = ''
    const letter = typed.slice(-1).toUpperCase()
    if (/^[A-Z]$/.test(letter)) {
      triggerHaptic(10)
      game.typeLetter(letter)
    }
  }

  useEffect(() => {
    if (solved) return undefined

    function handleKeyDown(event) {
      // The AnswerBox input handles its own typing - without this guard,
      // preventDefault() below would block characters from ever reaching
      // it. The hidden puzzle input is deliberately NOT skipped here (it
      // has no letter-handling of its own via keydown - that's onChange -
      // but navigation/backspace/escape still need to work while it's
      // focused, which is most of the time during normal play).
      const isHiddenPuzzleInput = event.target === hiddenInputRef.current
      const targetTag = event.target?.tagName
      if ((targetTag === 'INPUT' || targetTag === 'TEXTAREA') && !isHiddenPuzzleInput) return

      const key = event.key

      if (key === 'ArrowRight' || key === 'ArrowDown' || key === ' ') {
        event.preventDefault()
        game.moveNext()
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        event.preventDefault()
        game.movePrev()
      } else if (key === 'Backspace' || key === 'Delete') {
        event.preventDefault()
        triggerHaptic(10)
        game.deleteAndMoveBack()
      } else if (key === 'Escape' && gimmeMode) {
        event.preventDefault()
        setGimmeMode(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game, solved, gimmeMode])

  // The "cipher cracked" celebration - a one-shot flourish the moment the
  // decode transitions from incomplete/wrong to fully correct (not on
  // every render while it stays correct), plus a persistent badge for as
  // long as it remains correct. Undoing back out and re-completing it
  // replays the flourish, since the ref resets to false in between.
  useEffect(() => {
    if (game.isCipherSolved && !wasCipherSolvedRef.current) {
      wasCipherSolvedRef.current = true
      setJustCracked(true)
      triggerHaptic([25, 40, 60])
      const timeout = setTimeout(() => setJustCracked(false), 1300)
      return () => clearTimeout(timeout)
    }
    if (!game.isCipherSolved) {
      wasCipherSolvedRef.current = false
    }
    return undefined
  }, [game.isCipherSolved])

  function handleSelectPosition(position) {
    if (gimmeMode) {
      game.revealHint(game.ciphertext[position])
      setGimmeMode(false)
      return
    }
    game.selectPosition(position)
    hiddenInputRef.current?.focus()
  }

  function handleSelectLegendLetter(plainLetter) {
    if (gimmeMode) {
      game.revealPlainLetter(plainLetter)
      setGimmeMode(false)
      return
    }
    game.selectLegendLetter(plainLetter)
    hiddenInputRef.current?.focus()
  }

  function handleCheckPersonAnswer(guess) {
    // Naming the person correctly IS the win condition - independent of
    // how much of the cipher has actually been solved (the info screen
    // reveals the full quote/work/year regardless). Compared on letters
    // only (case/spacing/punctuation-insensitive) so "JRR Tolkien",
    // "j.r.r. tolkien", and "J. R. R. Tolkien" all match "J.R.R. Tolkien" -
    // reuses the same normalization the cipher itself is built from, since
    // it already strips exactly this kind of formatting noise down to
    // bare letters.
    const isRightPerson = normalizePersonName(guess) === normalizePersonName(puzzle.person)
    setFeedback(
      isRightPerson
        ? { kind: 'correct' }
        : { kind: 'wrong-person', message: "That's not who said it - try again." }
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
          {game.isCipherSolved && (
            <div className={`cipher-cracked-banner${justCracked ? ' cipher-cracked-banner-pop' : ''}`}>
              🎉 Cipher cracked! Now... who said it?
            </div>
          )}

          <div className={`quote-board-container${game.isCipherSolved ? ' is-cracked' : ''}${justCracked ? ' is-flashing' : ''}`}>
            <QuoteBoard
              ciphertext={game.ciphertext}
              guesses={game.guesses}
              selectedPosition={game.selectedPosition}
              selectedCipherLetter={game.selectedCipherLetter}
              onSelectPosition={handleSelectPosition}
            />
            {justCracked && (
              <div className="confetti-burst" aria-hidden="true">
                {CONFETTI.map((emoji, i) => (
                  <span
                    key={i}
                    className="confetti-piece"
                    style={{
                      left: `${(i * 37) % 100}%`,
                      animationDelay: `${(i % 5) * 0.06}s`,
                      fontSize: `${18 + (i % 4) * 6}px`,
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Legend
            ciphertext={game.ciphertext}
            plainToCipher={game.plainToCipher}
            selectedPlainLetter={game.selectedPlainLetter}
            onSelectPlainLetter={handleSelectLegendLetter}
          />

          {/* Off-screen but focusable (not display:none, which blocks
              focus/the keyboard entirely) - see the effect above. */}
          <input
            ref={hiddenInputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck="false"
            className="hidden-letter-input"
            onChange={handleHiddenInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />

          <Controls
            canUndo={game.canUndo}
            onUndo={game.undo}
            onReset={handleReset}
            onGimme={() => setGimmeMode((current) => !current)}
            gimmeActive={gimmeMode}
            onCheckTrack={handleCheckTrack}
            feedback={feedback}
          />

          <AnswerBox onCheck={handleCheckPersonAnswer} />
        </>
      )}

      {import.meta.env.DEV && <DebugPanel person={puzzle.person} />}
    </div>
  )
}

function App() {
  const [selection, setSelection] = useState(null)

  // Tactile feedback for every button in the app, delegated once at the
  // root rather than wired into each handler - covers genre/difficulty
  // selection, header actions, controls, Gimme, the answer box submit,
  // everything. Letter-typing gets its own haptic call in PuzzleGame since
  // that isn't a <button> click.
  useEffect(() => {
    function handleGlobalClick(event) {
      if (event.target.closest('button')) {
        triggerHaptic(10)
      }
    }
    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [])

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
