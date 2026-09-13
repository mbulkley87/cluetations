import { useMemo } from 'react'
import { ALPHABET, isLetter } from '../utils/cipher'

// Indexed by the PLAIN alphabet A-Z (fixed, always visible - it's just the
// alphabet, not a secret). Each cell shows the cipher letter the player
// has resolved for that plain letter, if any - i.e. plainToCipher, which
// only ever contains letters actually solved. The cipher is built FROM
// the person's name (see cipher.js), so reading this in order eventually
// spells it out as more gets solved - that's the intended payoff, not a
// leak: nothing appears here until the player has earned it.
function Legend({ ciphertext, plainToCipher, selectedPlainLetter, onSelectPlainLetter }) {
  // How many times each cipher letter actually appears in the puzzle - only
  // meaningful (and only shown) once a cell is resolved, since before that
  // there's no way to know which cipher letter's frequency to display.
  const letterCounts = useMemo(() => {
    const counts = {}
    for (const char of ciphertext) {
      if (isLetter(char)) counts[char] = (counts[char] || 0) + 1
    }
    return counts
  }, [ciphertext])

  return (
    <div className="legend">
      {ALPHABET.map((plainLetter) => {
        const resolvedCipherLetter = plainToCipher[plainLetter]
        return (
          <button
            key={plainLetter}
            type="button"
            className={[
              'legend-cell',
              plainLetter === selectedPlainLetter ? 'legend-cell-selected' : '',
            ].filter(Boolean).join(' ')}
            onClick={(event) => {
              onSelectPlainLetter(plainLetter)
              // A focused <button> has its own native Space/Arrow-key
              // behavior that can fight the global keyboard navigation
              // handler even with preventDefault() there - blurring it
              // right after the click leaves nothing focused to intercept
              // those keys afterward.
              event.currentTarget.blur()
            }}
          >
            <span className="legend-resolved">{resolvedCipherLetter || ' '}</span>
            <span className="legend-plain-row">
              <span className="legend-plain">{plainLetter}</span>
              {resolvedCipherLetter && (
                <span className="legend-count">{letterCounts[resolvedCipherLetter] || 0}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default Legend
