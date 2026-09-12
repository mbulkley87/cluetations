import { useState } from 'react'

// Shown once the quote itself is fully and correctly decoded - the last
// step is naming who actually said it, which the cipher deliberately never
// reveals (the person's name IS the cipher key).
function AnswerBox({ onCheck }) {
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onCheck(value)
  }

  return (
    <form className="answer-box" onSubmit={handleSubmit}>
      <label htmlFor="answer-box-input" className="answer-box-label">
        Quote decoded! Who said it?
      </label>
      <div className="answer-box-row">
        <input
          id="answer-box-input"
          type="text"
          className="answer-box-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type your guess..."
          autoFocus
        />
        <button type="submit" className="control-button control-button-submit">
          Check Answer
        </button>
      </div>
    </form>
  )
}

export default AnswerBox
