import { ALPHABET } from '../utils/cipher'

// Indexed by the PLAIN alphabet A-Z (fixed, always visible - it's just the
// alphabet, not a secret). Each cell shows the cipher letter the player
// has resolved for that plain letter, if any - i.e. plainToCipher, which
// only ever contains letters actually solved. The cipher is built FROM
// the person's name (see cipher.js), so reading this in order eventually
// spells it out as more gets solved - that's the intended payoff, not a
// leak: nothing appears here until the player has earned it.
function Legend({ plainToCipher, selectedPlainLetter, onSelectPlainLetter }) {
  return (
    <div className="legend">
      {ALPHABET.map((plainLetter) => (
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
            // handler even with preventDefault() there - blurring it right
            // after the click leaves nothing focused to intercept those
            // keys afterward.
            event.currentTarget.blur()
          }}
        >
          <span className="legend-resolved">{plainToCipher[plainLetter] || ' '}</span>
          <span className="legend-plain">{plainLetter}</span>
        </button>
      ))}
    </div>
  )
}

export default Legend
