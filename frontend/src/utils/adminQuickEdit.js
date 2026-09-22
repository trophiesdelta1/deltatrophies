const QUICK_EDIT_KEY = "adminQuickEditEnabled";

export function isQuickEditEnabled() {
  return sessionStorage.getItem(QUICK_EDIT_KEY) === "true";
}

export function setQuickEditEnabled(enabled) {
  if (enabled) sessionStorage.setItem(QUICK_EDIT_KEY, "true");
  else sessionStorage.removeItem(QUICK_EDIT_KEY);
}
