import { useState } from 'react'

// Google/Facebook are modeled on the backend (AuthProvider enum) but not
// wired up here yet - both need an OAuth app registered in their own
// developer console first. Shown disabled rather than hidden so the
// eventual real buttons don't feel like a surprise new feature later.
function LoginModal({ onClose, onLoginGuest }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!username.trim()) {
      setError('Enter a username first.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onLoginGuest(username.trim())
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong - try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card login-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="modal-title">Sign In</h2>
        <p className="modal-subtitle">Pick a username to appear on leaderboards.</p>

        <form onSubmit={handleSubmit} className="login-guest-form">
          <input
            type="text"
            className="login-username-input"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={20}
            autoFocus
          />
          <button type="submit" className="control-button login-guest-submit" disabled={submitting}>
            {submitting ? 'Joining...' : 'Continue as Guest'}
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}

        <div className="login-divider">or</div>

        <button type="button" className="login-provider-button" disabled title="Coming soon">
          <span aria-hidden="true">G</span> Sign in with Google
        </button>
        <button type="button" className="login-provider-button" disabled title="Coming soon">
          <span aria-hidden="true">f</span> Sign in with Facebook
        </button>
      </div>
    </div>
  )
}

export default LoginModal
