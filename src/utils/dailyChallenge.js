import { getPuzzlesByCategory } from '../data/puzzles'

const STORAGE_KEY = 'cluetations-daily-challenge'

// UTC rather than local time, so the challenge changes at the same moment
// for everyone regardless of timezone instead of flipping at a different
// wall-clock hour per player.
function getTodayDateString() {
  return new Date().toISOString().slice(0, 10)
}

// A simple deterministic string hash (djb2) - this only needs to spread
// dates across the pool reasonably evenly and consistently, nothing
// cryptographic. Hashing the calendar date directly (rather than counting
// "days since some epoch") sidesteps any epoch-reference or DST-adjacent
// edge cases entirely: the same date string always produces the same
// index, for everyone, forever.
function hashString(value) {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i)
  }
  return hash >>> 0
}

// The same calendar date always yields the same puzzle for every player -
// picked from every category combined, so a Books quote and a Movies
// quote are equally likely to be today's challenge.
export function getDailyChallengePuzzle() {
  const pool = getPuzzlesByCategory('any')
  const index = hashString(getTodayDateString()) % pool.length
  return pool[index]
}

function readStoredStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isDailyChallengeComplete(puzzleId) {
  const stored = readStoredStatus()
  return Boolean(stored && stored.date === getTodayDateString() && stored.puzzleId === puzzleId && stored.completed)
}

export function markDailyChallengeComplete(puzzleId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayDateString(), puzzleId, completed: true }))
  } catch {
    // Private browsing / storage disabled / quota exceeded - the daily
    // challenge just won't remember completion across a reload in that
    // case, which is a harmless degradation, not worth surfacing.
  }
}
