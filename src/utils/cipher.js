export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Uppercase, letters only - strips spaces, punctuation, apostrophes, and
// hyphens so "J.R.R. Tolkien" and "Martin Luther King Jr." reduce to a
// clean run of A-Z before the cipher is derived from them. Accented
// letters are folded to their base form first (e.g. an author named
// "e" with an acute accent becomes plain "E") rather than dropped
// outright - decomposing to NFD splits an accented letter into the base
// letter plus a separate combining accent mark (U+0300-U+036F), which the
// final strip then removes cleanly, leaving the base letter behind.
export function normalizePersonName(person) {
  return person
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}

// The substitution alphabet for a puzzle is deterministic, derived from
// the person's name rather than randomized - the same person always
// produces the same cipher.
//
// 1. Normalize the name.
// 2. Walk it left to right, keeping each letter only the first time it
//    appears - this becomes the start of the cipher sequence.
// 3. Append every letter NOT used in step 2, in reverse alphabetical
//    order (Z down to A).
// 4. Map plain A-Z (in order) to that 26-letter sequence position by
//    position.
//
// Worked example - DOLLY PARTON:
//   normalized:  DOLLYPARTON
//   unique run:  D O L Y P A R T N        (second L, second O are skipped)
//   unused, Z->A: Z X W V U S Q M K J I H T F E C B G ... filtered down to
//                 just the letters not already used: Z X W V U S Q M K J I H G F E C B
//   full sequence: D O L Y P A R T N Z X W V U S Q M K J I H G F E C B
//   so A->D, B->O, C->L, D->Y, E->P, F->A, G->R, H->T, I->N, J->Z, ...
//
// Exposed on its own (not just folded into buildCipherAlphabet) because the
// legend displays all 26 cipher letters in exactly this order - the
// person's own unique letters first, then the reverse-alphabet leftovers.
export function buildCipherSequence(person) {
  const normalized = normalizePersonName(person)

  const seen = new Set()
  const uniqueLetters = []
  for (const char of normalized) {
    if (!seen.has(char)) {
      seen.add(char)
      uniqueLetters.push(char)
    }
  }

  const unusedReversed = []
  for (let i = ALPHABET.length - 1; i >= 0; i--) {
    const letter = ALPHABET[i]
    if (!seen.has(letter)) unusedReversed.push(letter)
  }

  return [...uniqueLetters, ...unusedReversed]
}

export function buildCipherAlphabet(person) {
  const cipherSequence = buildCipherSequence(person)
  const cipher = {}
  ALPHABET.forEach((letter, index) => {
    cipher[letter] = cipherSequence[index]
  })
  return cipher
}

// The inverse of buildCipherAlphabet - cipher letter -> correct plain
// letter. This is what powers the hint feature (reveal the true answer
// for one cipher letter) without duplicating the cipher-derivation logic.
export function buildReverseCipherAlphabet(person) {
  const cipher = buildCipherAlphabet(person)
  const reverse = {}
  for (const [plainLetter, cipherLetter] of Object.entries(cipher)) {
    reverse[cipherLetter] = plainLetter
  }
  return reverse
}

// Only A-Z gets substituted - spaces, punctuation, and apostrophes pass
// through untouched so word shape stays visible (that's what makes
// frequency/pattern analysis possible at all).
export function encryptQuote(quote, person) {
  const cipher = buildCipherAlphabet(person)
  return quote
    .toUpperCase()
    .split('')
    .map((char) => (/[A-Z]/.test(char) ? cipher[char] : char))
    .join('')
}

export function isLetter(char) {
  return /[A-Z]/.test(char)
}
