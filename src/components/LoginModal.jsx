import { useState } from 'react'

const MODES = [
  { value: 'login', label: 'Log In' },
  { value: 'signup', label: 'Sign Up' },
]

// Username/password is the primary path now (recoverable from any browser -
// see accounts-service's AccountsService.register/login). Guest stays as a
// lower-friction fallback for a quick look, but a password account is
// recommended for anyone who wants their leaderboard name to persist across
// devices. Google/Facebook are modeled on the backend but not wired up here
// yet - both need an OAuth app registered in their own developer console
// first. Shown disabled rather than hidden so the eventual real buttons
// don't feel like a surprise new feature later.
function LoginModal({ onClose, onLoginGuest, onRegisterPassword, onLoginPassword }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [guestUsername, setGuestUsername] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Enter a username and password.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'signup') {
        await onRegisterPassword(username.trim(), password)
      } else {
        await onLoginPassword(username.trim(), password)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong - try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGuestSubmit(event) {
    event.preventDefault()
    if (!guestUsername.trim()) {
      setError('Enter a username first.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onLoginGuest(guestUsername.trim())
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
        <p className="modal-subtitle">Log in (or create an account) to appear on leaderboards.</p>

        <div className="login-mode-switch">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              className={mode === m.value ? 'active' : ''}
              onClick={() => { setMode(m.value); setError(null) }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handlePasswordSubmit} className="login-guest-form">
          <input
            type="text"
            className="login-username-input"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={20}
            autoFocus
          />
          <input
            type="password"
            className="login-username-input"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
          />
          <button type="submit" className="control-button login-guest-submit" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="login-divider">or</div>

        <form onSubmit={handleGuestSubmit} className="login-guest-form">
          <input
            type="text"
            className="login-username-input"
            placeholder="Guest username"
            value={guestUsername}
            onChange={(event) => setGuestUsername(event.target.value)}
            maxLength={20}
          />
          <button type="submit" className="control-button login-guest-submit" disabled={submitting}>
            Continue as Guest
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
