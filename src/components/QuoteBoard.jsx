import { isLetter } from '../utils/cipher'

// Words are grouped into their own non-wrapping spans so a word never
// splits across lines - the container wraps between words, never inside
// one. Splitting on ' ' throws away the space characters themselves, so
// charIndex has to be nudged forward one extra step at each word boundary
// to stay aligned with the real ciphertext indices selection/guesses use.
function QuoteBoard({ ciphertext, guesses, selectedPosition, selectedCipherLetter, onSelectPosition }) {
  const words = ciphertext.split(' ')
  let charIndex = 0

  return (
    <div className="quote-board">
      {words.map((word, wordIndex) => {
        const wordEl = (
          <span className="quote-word" key={wordIndex}>
            {word.split('').map((char) => {
              const index = charIndex
              charIndex += 1

              if (!isLetter(char)) {
                return (
                  <span key={index} className="quote-punct">
                    {char}
                  </span>
                )
              }

              const guessed = guesses[char]
              const isSelected = index === selectedPosition
              const isRelated = !isSelected && char === selectedCipherLetter

              return (
                <button
                  key={index}
                  type="button"
                  className={[
                    'quote-tile',
                    isSelected ? 'quote-tile-selected' : '',
                    isRelated ? 'quote-tile-related' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={(event) => {
                    onSelectPosition(index)
                    // See Legend.jsx's identical blur - a focused <button>
                    // has native Space/Arrow-key behavior that can fight
                    // the global keyboard navigation handler otherwise.
                    event.currentTarget.blur()
                  }}
                >
                  <span className="quote-tile-guess">{guessed || ' '}</span>
                  <span className="quote-tile-cipher">{char}</span>
                </button>
              )
            })}
          </span>
        )
        charIndex += 1 // the space consumed between this word and the next
        return wordEl
      })}
    </div>
  )
}

export default QuoteBoard
