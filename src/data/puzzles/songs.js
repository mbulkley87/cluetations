// person = the performing artist/group. This is what the cipher is
// derived from - see src/utils/cipher.js. work = the song title
// (metadata only).
//
// These two seed entries are traditional/public-domain songs (both
// 200+ years old) specifically to avoid quoting copyrighted lyrics before
// a properly licensed production dataset is supplied - "person" here is
// each song's original writer, the closest public-domain equivalent to a
// "performing artist" that's still safe to ship. Replace/extend this file
// with the real licensed song dataset when it's ready; nothing else in the
// app needs to change to support it.
const songs = [
  {
    id: 'songs-001',
    category: 'songs',
    quote: 'Amazing grace, how sweet the sound, that saved a wretch like me. I once was lost, but now am found, was blind but now I see.',
    person: 'John Newton',
    work: 'Amazing Grace',
    year: 1772,
    hint: 'A hymn of redemption written by a former slave ship captain turned clergyman.',
    difficulty: 'medium',
  },
  {
    id: 'songs-002',
    category: 'songs',
    quote: 'Should auld acquaintance be forgot, and never brought to mind. Should auld acquaintance be forgot, and days of auld lang syne.',
    person: 'Robert Burns',
    work: 'Auld Lang Syne',
    year: 1788,
    hint: "A Scottish poem about old friendships, traditionally sung at New Year's.",
    difficulty: 'medium',
  },
]

export default songs
