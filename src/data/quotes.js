export const GENRES = ['MOVIES_SHOWS', 'SONGS', 'SPEECHES', 'BOOKS']

export const GENRE_LABELS = {
  MOVIES_SHOWS: 'Movies/Shows',
  SONGS: 'Songs',
  SPEECHES: 'Speeches',
  BOOKS: 'Books',
}

// Placeholder pool - the same 2 test quotes in every genre until the real
// per-genre lists are compiled. Swap each genre's array independently once
// the real lists are ready; randomQuoteFor already picks per-genre.
const TEST_QUOTES = ['Hello World', 'Fubar']

export const QUOTES_BY_GENRE = {
  MOVIES_SHOWS: TEST_QUOTES,
  SONGS: TEST_QUOTES,
  SPEECHES: TEST_QUOTES,
  BOOKS: TEST_QUOTES,
}

export function randomQuoteFor(genre) {
  const pool = QUOTES_BY_GENRE[genre] || []
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
