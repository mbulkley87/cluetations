function Controls({ canUndo, onUndo, onReset, onSubmit, feedback }) {
  return (
    <div className="controls">
      <div className="controls-buttons">
        <button type="button" className="control-button" onClick={onUndo} disabled={!canUndo}>
          ↶ Undo
        </button>
        <button type="button" className="control-button" onClick={onReset}>
          ↻ Reset
        </button>
        <button type="button" className="control-button control-button-submit" onClick={onSubmit}>
          Submit
        </button>
      </div>
      {feedback && (
        <div className={`controls-feedback controls-feedback-${feedback.kind}`}>
          {feedback.message}
        </div>
      )}
    </div>
  )
}

export default Controls
