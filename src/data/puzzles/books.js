// person = the book's author. This is what the cipher is derived from -
// see src/utils/cipher.js. work = the book title (metadata only, never
// used to build the cipher).
const books = [
  {
    id: 'books-001',
    category: 'books',
    quote: 'It was the best of times, it was the worst of times, it was the age of wisdom.',
    person: 'Charles Dickens',
    work: 'A Tale of Two Cities',
    year: 1859,
    hint: 'Two cities endure upheaval, sacrifice, and sharply contrasting fortunes.',
    difficulty: 'easy',
  },
  {
    id: 'books-002',
    category: 'books',
    quote: 'All animals are equal, but some animals are more equal than others.',
    person: 'George Orwell',
    work: 'Animal Farm',
    year: 1945,
    hint: 'A revolution on rural property slowly recreates the tyranny it opposed.',
    difficulty: 'easy',
  },
  {
    id: 'books-003',
    category: 'books',
    quote: 'All we have to decide is what to do with the time that is given us.',
    person: 'J.R.R. Tolkien',
    work: 'The Fellowship of the Ring',
    year: 1954,
    hint: 'A wizard, a ring, and a fellowship set out to save Middle-earth.',
    difficulty: 'medium',
  },
]

export default books
