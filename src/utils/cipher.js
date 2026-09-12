const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// A derangement (no letter encodes to itself) and a full 1:1 bijection -
// every ciphertext letter maps back to exactly one plaintext letter, which
// is what makes "guess this cipher letter everywhere at once" meaningful.
export function generateCipher() {
  let shuffled
  do {
    shuffled = shuffle(ALPHABET)
  } while (shuffled.some((letter, index) => letter === ALPHABET[index]))

  const cipher = {}
  ALPHABET.forEach((letter, index) => {
    cipher[letter] = shuffled[index]
  })
  return cipher
}

export function encode(text, cipher) {
  return text
    .toUpperCase()
    .split('')
    .map((char) => (/[A-Z]/.test(char) ? cipher[char] : char))
    .join('')
}

export function isLetter(char) {
  return /[A-Z]/.test(char)
}
