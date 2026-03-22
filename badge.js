/**
 * Slack PWA - Badge Script (MAIN world)
 * Runs in the page's JavaScript context so navigator.setAppBadge()
 * targets the installed PWA's OS-level app icon, not the extension.
 *
 * Platform support:
 *   Windows (Chrome/Edge 81+)  — numeric badge on taskbar icon
 *   macOS   (Chrome 81+)       — numeric badge on dock icon
 *   macOS   (Safari 17+)       — numeric badge (dot badge NOT supported)
 *   ChromeOS (91+)             — numeric badge on shelf icon
 *   Linux/GNOME                — API exists but badges are NOT displayed
 *                                (Chromium limitation, not our bug)
 */

const SAFARI_UA_PATTERN = /^((?!chrome|android).)*safari/i;
const NO_COUNT_INDICATOR = -1;
const DOT_INDICATOR = 0;

document.documentElement.addEventListener("slack-pwa-badge", () => {
  const badgeValue = document.documentElement.getAttribute("data-badge-count");
  const count = badgeValue !== null ? parseInt(badgeValue, 10) : NO_COUNT_INDICATOR;

  if (typeof navigator.setAppBadge !== "function") return;

  if (count > 0) {
    navigator.setAppBadge(count).catch(() => {});
  } else if (count === DOT_INDICATOR) {
    // Slack shows "•" (activity, no specific count).
    // Chrome/Edge: shows a dot indicator.
    // Safari: ignores no-arg call — use 1 as minimum visible badge.
    const isSafari = SAFARI_UA_PATTERN.test(navigator.userAgent);
    if (isSafari) {
      navigator.setAppBadge(1).catch(() => {});
    } else {
      navigator.setAppBadge().catch(() => {});
    }
  } else {
    navigator.clearAppBadge().catch(() => {});
  }
});
