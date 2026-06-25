/**
 * Returns true if the current session has been flagged as a bot.
 * Call this before any client-side fetch to silently suppress it.
 */
export function isBotBlocked(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem("bot_blocked") === "1"
}
