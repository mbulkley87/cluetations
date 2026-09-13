import { useMemo } from 'react'
import { isLetter } from '../utils/cipher'

function Legend({ ciphertext, legendLetters, guesses, selectedCipherLetter, onSelectCipherLetter }) {
  // How many times each cipher letter actually appears in the puzzle - a
  // classic frequency-analysis aid. Most of legendLetters' 26 letters
  // won't appear in a short quote at all, hence the || 0 fallback below.
  const letterCounts = useMemo(() => {
    const counts = {}
    for (const char of ciphertext) {
      if (isLetter(char)) counts[char] = (counts[char] || 0) + 1
    }
    return counts
  }, [ciphertext])

  return (
    <div className="legend">
      {legendLetters.map((cipherLetter) => (
        <button
          key={cipherLetter}
          type="button"
          className={[
            'legend-cell',
            cipherLetter === selectedCipherLetter ? 'legend-cell-selected' : '',
          ].filter(Boolean).join(' ')}
          onClick={(event) => {
            onSelectCipherLetter(cipherLetter)
            // A focused <button> has its own native Space/Arrow-key
            // behavior that can fight the global keyboard navigation
            // handler even with preventDefault() there - blurring it right
            // after the click leaves nothing focused to intercept those
            // keys afterward.
            event.currentTarget.blur()
          }}
        >
          <span className="legend-guess">{guesses[cipherLetter] || ' '}</span>
          <span className="legend-cipher-row">
            <span className="legend-cipher">{cipherLetter}</span>
            <span className="legend-count">{letterCounts[cipherLetter] || 0}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export default Legend
