const ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  'ZXCVBNM'.split(''),
]

// A physical keyboard's keydown events are the only way this game accepts
// letters otherwise - fine on desktop, but tapping a <button> on a phone
// never summons the OS keyboard, so mobile players had no way to type at
// all. This gives touch users the same typeLetter/deleteAndMoveBack calls
// a keydown would have made, without needing an actual text input
// anywhere (which would need its own value-syncing and IME handling).
function Keyboard({ onType, onDelete }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, rowIndex) => (
        <div className="keyboard-row" key={rowIndex}>
          {rowIndex === 2 && (
            <button type="button" className="keyboard-key keyboard-key-wide" onClick={onDelete}>
              ⌫
            </button>
          )}
          {row.map((letter) => (
            <button key={letter} type="button" className="keyboard-key" onClick={() => onType(letter)}>
              {letter}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
