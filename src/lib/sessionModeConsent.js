const SESSION_MODE_CONFIRM_REQUIRED_KEY = "mindfulai_session_mode_confirm_required";

export function getSessionModeConfirmationRequired() {
  if (typeof window === "undefined") return true;

  try {
    const raw = window.localStorage.getItem(SESSION_MODE_CONFIRM_REQUIRED_KEY);
    if (raw === null) return true;
    return raw !== "false";
  } catch {
    return true;
  }
}

export function setSessionModeConfirmationRequired(required) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      SESSION_MODE_CONFIRM_REQUIRED_KEY,
      required ? "true" : "false"
    );
  } catch {
    // ignore storage errors
  }
}
