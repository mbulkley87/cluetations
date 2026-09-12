import books from './books'
import movies from './movies'
import speeches from './speeches'
import songs from './songs'

// The UI never imports a category file directly or cares how many puzzles
// exist in it - this module is the entire data layer surface. Each
// category file can grow toward ~300 entries independently without
// touching anything else (a single component importing 1,200+ objects
// directly is exactly what this indirection avoids).
export const CATEGORIES = ['movies', 'songs', 'speeches', 'books']

export const CATEGORY_LABELS = {
  movies: 'Movies/Shows',
  songs: 'Songs',
  speeches: 'Speeches',
  books: 'Books',
}

const PUZZLES_BY_CATEGORY = { movies, songs, speeches, books }

export function getPuzzlesByCategory(category) {
  return PUZZLES_BY_CATEGORY[category] || []
}

// Tracks which puzzle ids have already been shown per category during
// this session (module-scoped singleton - resets on a full page reload,
// which is a reasonable reading of "session"). Cycles through every
// unseen puzzle in a category before it's willing to repeat any of them,
// and never hands back the exact one that was just showing.
const shownByCategory = {}

export function pickRandomPuzzle(category, excludeId = null) {
  const pool = getPuzzlesByCategory(category)
  if (!pool.length) return null
  if (pool.length === 1) return pool[0]

  const shown = shownByCategory[category] || (shownByCategory[category] = new Set())

  let candidates = pool.filter((puzzle) => !shown.has(puzzle.id))
  if (!candidates.length) {
    shown.clear()
    candidates = pool
  }
  // Never immediately repeat the puzzle that's currently showing, even
  // across a reshuffle boundary, as long as there's another option.
  const withoutCurrent = candidates.filter((puzzle) => puzzle.id !== excludeId)
  const finalCandidates = withoutCurrent.length ? withoutCurrent : candidates

  const choice = finalCandidates[Math.floor(Math.random() * finalCandidates.length)]
  shown.add(choice.id)
  return choice
}
