// Shared across every game under matthewbulkley.com, not specific to
// ClueTations - see the accounts-service repo. No local dev proxy needed
// (unlike a same-origin backend) since this is always a different origin;
// the service's own CORS config already allows localhost:5173/5174.
const BASE_URL = import.meta.env.VITE_ACCOUNTS_API_URL || 'https://accounts.matthewbulkley.com'

async function parseOrThrow(response) {
  if (response.ok) return response.status === 204 ? null : response.json()
  const message = await response.text().catch(() => '')
  throw new Error(message || `Request failed (${response.status})`)
}

export async function loginAsGuest(username) {
  const response = await fetch(`${BASE_URL}/api/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
  return parseOrThrow(response)
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseOrThrow(response)
}

export async function submitScore(token, game, score) {
  const response = await fetch(`${BASE_URL}/api/leaderboard/${game}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ score }),
  })
  return parseOrThrow(response)
}

export async function fetchLeaderboard(game, limit = 20) {
  const response = await fetch(`${BASE_URL}/api/leaderboard/${game}?limit=${limit}`)
  return parseOrThrow(response)
}
