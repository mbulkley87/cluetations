import { useCallback, useEffect, useState } from 'react'
import { loginAsGuest, fetchCurrentUser } from '../services/accountsApi'

const STORAGE_KEY = 'cluetations-account-session'

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredSession(session) {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Private browsing / storage disabled / quota exceeded - harmless degradation, just can't persist.
  }
}

// A guest session has no password - the token IS the credential, so a
// malformed/expired one just means "logged out," not an error state worth
// surfacing. This hook never blocks gameplay on the account check; it's
// purely additive (login to appear on leaderboards, play without it too).
function useAccount() {
  const [session, setSession] = useState(readStoredSession)
  const [checking, setChecking] = useState(Boolean(session))

  useEffect(() => {
    if (!session) {
      setChecking(false)
      return
    }
    let cancelled = false
    fetchCurrentUser(session.token)
      .then((user) => {
        if (!cancelled) setSession((current) => (current ? { ...current, username: user.username } : current))
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null)
          writeStoredSession(null)
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => { cancelled = true }
    // Only re-validate when the token itself changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token])

  const loginGuest = useCallback(async (username) => {
    const result = await loginAsGuest(username)
    const next = { token: result.token, userId: result.userId, username: result.username }
    setSession(next)
    writeStoredSession(next)
    return next
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    writeStoredSession(null)
  }, [])

  return {
    isLoggedIn: Boolean(session),
    isChecking: checking,
    username: session?.username ?? null,
    token: session?.token ?? null,
    loginGuest,
    logout,
  }
}

export default useAccount
