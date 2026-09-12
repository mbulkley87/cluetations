import { useMemo } from 'react'
import { isLetter } from '../utils/cipher'

function Legend({ ciphertext, guesses, selectedCipherLetter, onSelectCipherLetter }) {
  const distinctCipherLetters = useMemo(() => {
    const seen = new Set()
    ciphertext.split('').forEach((char) => {
      if (isLetter(char)) seen.add(char)
    })
    return [...seen].sort()
  }, [ciphertext])

  return (
    <div className="legend">
      {distinctCipherLetters.map((cipherLetter) => (
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
          <span className="legend-cipher">{cipherLetter}</span>
        </button>
      ))}
    </div>
  )
}

export default Legend
