import { useEffect, useState } from 'react'
import './App.css'
import GenreSelect from './components/GenreSelect'
import QuoteBoard from './components/QuoteBoard'
import Legend from './components/Legend'
import Controls from './components/Controls'
import useCryptogram from './hooks/useCryptogram'
import { GENRE_LABELS, randomQuoteFor } from './data/quotes'

function Puzzle({ genre, onChangeGenre }) {
  const [quote, setQuote] = useState(() => randomQuoteFor(genre))
  const game = useCryptogram(quote)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key

      if (key === 'ArrowRight' || key === ' ') {
        event.preventDefault()
        game.moveNext()
      } else if (key === 'ArrowLeft') {
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
  }, [game])

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
    setQuote(randomQuoteFor(genre))
  }

  return (
    // Remounting on quote change is deliberate - useCryptogram seeds its
    // cipher once per mount, so a new quote needs a fresh instance rather
    // than trying to reset an existing one in place.
    <div className="puzzle-screen" key={quote}>
      <div className="puzzle-header">
        <span className="puzzle-genre">{GENRE_LABELS[genre]}</span>
        <div className="puzzle-header-actions">
          <button type="button" className="text-button" onClick={handleNewQuote}>
            New Quote
          </button>
          <button type="button" className="text-button" onClick={onChangeGenre}>
            Change Genre
          </button>
        </div>
      </div>

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
    </div>
  )
}

function App() {
  const [genre, setGenre] = useState(null)

  if (!genre) {
    return <GenreSelect onChoose={setGenre} />
  }

  return <Puzzle genre={genre} onChangeGenre={() => setGenre(null)} />
}

export default App
