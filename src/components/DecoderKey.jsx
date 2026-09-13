import { ALPHABET } from '../utils/cipher'

// A passive, read-only strip - not interactive like the Legend. The cipher
// is built FROM the person's name (see cipher.js), so once enough letters
// are solved, reading this in fixed A-Z order starts spelling it out.
// That's the intended payoff for actually solving the quote: it only ever
// shows a cipher letter here once the player has solved it themselves
// (plainToCipher only contains entries for letters already guessed).
function DecoderKey({ plainToCipher }) {
  return (
    <div className="decoder-key">
      <div className="decoder-key-label">Cipher Key</div>
      <div className="decoder-key-row">
        {ALPHABET.map((plainLetter) => (
          <div key={plainLetter} className="decoder-key-cell">
            <span className="decoder-key-cipher">{plainToCipher[plainLetter] || ''}</span>
            <span className="decoder-key-plain">{plainLetter}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DecoderKey
