import { useState } from 'react'

// Always present - guessing the person correctly IS the win condition,
// independent of how much of the cipher the player has actually solved.
// The person's name is deliberately never shown anywhere else (it IS the
// cipher key); this is the only place to name them.
function AnswerBox({ onCheck }) {
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onCheck(value)
  }

  return (
    <form className="answer-box" onSubmit={handleSubmit}>
      <label htmlFor="answer-box-input" className="answer-box-label">
        Who said it?
      </label>
      <div className="answer-box-row">
        <input
          id="answer-box-input"
          type="text"
          className="answer-box-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type your guess..."
        />
        <button type="submit" className="control-button control-button-submit">
          Submit
        </button>
      </div>
    </form>
  )
}

export default AnswerBox
