// Always visible, same as any site-wide account affordance - clicking it
// when logged out opens LoginModal; when logged in it just shows who you
// are plus a way to sign out. Deliberately not gating anything: play works
// fully logged-out, this is purely about appearing on leaderboards.
function AccountWidget({ isLoggedIn, isChecking, username, onSignIn, onSignOut }) {
  if (isChecking) return null

  return (
    <div className="account-widget">
      {isLoggedIn ? (
        <>
          <span className="account-widget-username">👤 {username}</span>
          <button type="button" className="text-button" onClick={onSignOut}>
            Sign Out
          </button>
        </>
      ) : (
        <button type="button" className="text-button" onClick={onSignIn}>
          Sign In
        </button>
      )}
    </div>
  )
}

export default AccountWidget
