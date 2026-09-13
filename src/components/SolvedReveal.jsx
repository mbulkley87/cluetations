function SolvedReveal({ quote, person, work, year, onNewQuote, onChangeGenre }) {
  return (
    <div className="solved-reveal">
      <div className="solved-title">CORRECT!</div>
      <blockquote className="solved-quote">&ldquo;{quote}&rdquo;</blockquote>
      <div className="solved-person">{person}</div>
      <div className="solved-work">{work} ({year})</div>
      <div className="solved-actions">
        <button type="button" className="control-button" onClick={onNewQuote}>
          New Quote
        </button>
        <button type="button" className="control-button" onClick={onChangeGenre}>
          Change Genre
        </button>
      </div>
    </div>
  )
}

export default SolvedReveal
