import { useEffect, useState } from 'react'
import { fetchLeaderboard } from '../services/accountsApi'

function LeaderboardModal({ onClose }) {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchLeaderboard('cluetations', 20)
      .then((data) => { if (!cancelled) setEntries(data) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load the leaderboard.') })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card leaderboard-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="modal-title">🏆 Leaderboard</h2>

        {error && <p className="login-error">{error}</p>}
        {!error && entries === null && <p className="modal-subtitle">Loading...</p>}
        {!error && entries?.length === 0 && <p className="modal-subtitle">No scores yet - be the first!</p>}
        {!error && entries?.length > 0 && (
          <ol className="leaderboard-list">
            {entries.map((entry, index) => (
              <li key={entry.userId} className="leaderboard-row">
                <span className="leaderboard-rank">#{index + 1}</span>
                <span className="leaderboard-name">{entry.username}</span>
                <span className="leaderboard-score">{entry.score}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export default LeaderboardModal
