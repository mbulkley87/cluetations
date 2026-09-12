import { buildCipherAlphabet } from '../utils/cipher'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Dev-only - never rendered in a production build (see the import.meta.env.DEV
// guard at the call site in App.jsx). Shows the one thing a player must never
// see mid-puzzle: the person's name, since it IS the cipher key.
function DebugPanel({ person }) {
  const cipher = buildCipherAlphabet(person)
  const cipherRow = ALPHABET.split('').map((letter) => cipher[letter]).join('')

  return (
    <div className="debug-panel">
      <div className="debug-panel-label">DEV ONLY</div>
      <div>Person: {person.toUpperCase()}</div>
      <div className="debug-panel-row">{ALPHABET}</div>
      <div className="debug-panel-row">{cipherRow}</div>
    </div>
  )
}

export default DebugPanel
