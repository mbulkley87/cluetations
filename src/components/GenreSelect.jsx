import { GENRES, GENRE_LABELS } from '../data/quotes'

function GenreSelect({ onChoose }) {
  return (
    <div className="genre-select">
      <h1 className="game-title">ClueTations</h1>
      <p className="game-subtitle">Crack the quote. Pick where it's from.</p>
      <div className="genre-grid">
        {GENRES.map((genre) => (
          <button key={genre} className="genre-button" onClick={() => onChoose(genre)}>
            {GENRE_LABELS[genre]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default GenreSelect
