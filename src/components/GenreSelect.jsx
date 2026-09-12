import { CATEGORIES, CATEGORY_LABELS } from '../data/puzzles'

function GenreSelect({ onChoose }) {
  return (
    <div className="genre-select">
      <h1 className="game-title">ClueTations</h1>
      <p className="game-subtitle">Crack the quote. Pick where it's from.</p>
      <div className="genre-grid">
        {CATEGORIES.map((category) => (
          <button key={category} className="genre-button" onClick={() => onChoose(category)}>
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default GenreSelect
