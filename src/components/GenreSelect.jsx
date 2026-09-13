import { useState } from 'react'
import { CATEGORIES, CATEGORY_LABELS } from '../data/puzzles'

const DIFFICULTIES = [
  { value: null, label: 'Any' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

function GenreSelect({ onChoose }) {
  const [difficulty, setDifficulty] = useState(null)

  return (
    <div className="genre-select">
      <h1 className="game-title">ClueTations</h1>
      <p className="game-subtitle">Crack the quote. Pick where it's from.</p>

      <div className="difficulty-row">
        {DIFFICULTIES.map((option) => (
          <button
            key={option.label}
            type="button"
            className={['difficulty-button', option.value === difficulty ? 'difficulty-button-selected' : ''].filter(Boolean).join(' ')}
            onClick={() => setDifficulty(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="genre-grid">
        {CATEGORIES.map((category) => (
          <button key={category} className="genre-button" onClick={() => onChoose(category, difficulty)}>
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default GenreSelect
