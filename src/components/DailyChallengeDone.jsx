// Shown instead of a fresh puzzle when the player already solved today's
// Daily Challenge - there's only one per day, so revisiting recaps it
// rather than handing out a new attempt.
function DailyChallengeDone({ quote, person, work, year, onChangeGenre }) {
  return (
    <div className="puzzle-screen">
      <div className="puzzle-header">
        <span className="puzzle-genre">🗓️ Daily Challenge</span>
        <div className="puzzle-header-actions">
          <button type="button" className="text-button" onClick={onChangeGenre}>
            Change Genre
          </button>
        </div>
      </div>

      <div className="solved-reveal">
        <div className="solved-title">✅ Already Solved!</div>
        <blockquote className="solved-quote">&ldquo;{quote}&rdquo;</blockquote>
        <div className="solved-person">{person}</div>
        <div className="solved-work">{work} ({year})</div>
        <p className="daily-comeback-note">Come back tomorrow for a new Daily Challenge.</p>
        <div className="solved-actions">
          <button type="button" className="control-button" onClick={onChangeGenre}>
            Change Genre
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyChallengeDone
