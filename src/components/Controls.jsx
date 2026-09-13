function Controls({
  canUndo,
  onUndo,
  onReset,
  onSubmit,
  onYear,
  yearRevealed,
  onHint,
  hintRevealed,
  onGimme,
  gimmeActive,
  onCheckTrack,
  feedback,
}) {
  return (
    <div className="controls">
      <div className="controls-buttons">
        <button type="button" className="control-button" onClick={onUndo} disabled={!canUndo}>
          ↶ Undo
        </button>
        <button type="button" className="control-button" onClick={onReset}>
          ↻ Reset
        </button>
        <button type="button" className="control-button" onClick={onYear} disabled={yearRevealed}>
          📅 Year
        </button>
        <button type="button" className="control-button" onClick={onHint} disabled={hintRevealed}>
          📖 Hint
        </button>
        <button
          type="button"
          className={['control-button', 'control-button-gimme', gimmeActive ? 'control-button-gimme-active' : ''].filter(Boolean).join(' ')}
          onClick={onGimme}
        >
          🎁 Gimme
        </button>
        <button type="button" className="control-button" onClick={onCheckTrack}>
          🎯 On Track?
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
