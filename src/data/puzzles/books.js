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
  },
  {
    id: 'books-002',
    category: 'books',
    quote: 'All animals are equal, but some animals are more equal than others.',
    person: 'George Orwell',
    work: 'Animal Farm',
  },
  {
    id: 'books-003',
    category: 'books',
    quote: 'All we have to decide is what to do with the time that is given us.',
    person: 'J.R.R. Tolkien',
    work: 'The Fellowship of the Ring',
  },
]

export default books
