// person = the actor/actress who actually delivers the line on screen,
// NOT the character. This is what the cipher is derived from - see
// src/utils/cipher.js. work = the movie/show title (metadata only).
const movies = [
  {
    id: 'movies-001',
    category: 'movies',
    quote: "My mama always said life was like a box of chocolates. You never know what you're gonna get.",
    person: 'Tom Hanks',
    work: 'Forrest Gump',
  },
  {
    id: 'movies-002',
    category: 'movies',
    quote: 'No matter what anybody tells you, words and ideas can change the world.',
    person: 'Robin Williams',
    work: 'Dead Poets Society',
  },
  {
    id: 'movies-003',
    category: 'movies',
    quote: "You don't want the truth because deep down in places you don't talk about at parties, you want me on that wall.",
    person: 'Jack Nicholson',
    work: 'A Few Good Men',
  },
]

export default movies
