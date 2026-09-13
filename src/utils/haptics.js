// navigator.vibrate is unsupported on iOS Safari entirely, and on plenty
// of Android browsers/settings too - this is a best-effort enhancement,
// never something else depends on. The CSS :active press states on every
// button (scale-down + color shift) are the actual visual fallback and
// apply unconditionally regardless of vibration support, so there's
// nothing else to branch on here.
export function triggerHaptic(pattern = 10) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern)
  }
}
