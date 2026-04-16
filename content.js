/**
 * Slack PWA - Content Script
 * Injects PWA manifest and monitors Slack for unread notifications.
 */

const MANIFEST_URL =
  "https://raw.githubusercontent.com/gxanshu/slack-pwa/main/pwa/pwa-manifest.json";
const INIT_DELAY_MS = 2000;
const POLL_INTERVAL_MS = 1000;

// Inject PWA manifest so Slack can be installed as a standalone app
const manifestLink = document.createElement("link");
manifestLink.rel = "manifest";
manifestLink.href = MANIFEST_URL;
document.head.appendChild(manifestLink);

/**
 * Extract unread notification count from Slack's document title.
 * Slack uses patterns like "(3) Slack", "3 channel", "[3] Slack", or "• Slack".
 * Returns: positive number for count, 0 for indicator-only, -1 for none.
 */
function getNotificationCount(title) {
  const trimmedTitle = title.trim();
  const countMatch =
    trimmedTitle.match(/^\((\d+)\)/) ||
    trimmedTitle.match(/^(\d+)\s/) ||
    trimmedTitle.match(/^\[(\d+)\]/) ||
    trimmedTitle.match(/\s+-\s+(\d+)\s+new\s+items?\s+-\s+/);
  if (countMatch) return parseInt(countMatch[1], 10);
  if (trimmedTitle.startsWith("\u2022")) return 0;
  return -1;
}

/**
 * Set the PWA badge by communicating with the MAIN world badge.js script.
 * Uses a DOM attribute + custom event to cross the isolated/MAIN world boundary.
 */
function setBadge(count) {
  document.documentElement.setAttribute("data-badge-count", String(count));
  document.documentElement.dispatchEvent(new Event("slack-pwa-badge"));
}

let lastCount = -1;

function checkTitle() {
  const count = getNotificationCount(document.title);
  if (count === lastCount) return;

  const wasQuiet = lastCount < 0;
  lastCount = count;

  // Set PWA badge directly via MAIN world script (immediate, no roundtrip)
  setBadge(count);

  // Notify service worker for sound playback and extension icon badge
  chrome.runtime
    .sendMessage({
      type: "NOTIFICATION_UPDATE",
      count,
      playSound: count >= 0 && wasQuiet,
    })
    .catch(() => {});
}

function init() {
  lastCount = getNotificationCount(document.title);

  // Set initial badge state
  setBadge(lastCount);

  // Send initial state to service worker for extension icon badge
  chrome.runtime
    .sendMessage({ type: "NOTIFICATION_UPDATE", count: lastCount })
    .catch(() => {});

  // Watch <title> element for mutations
  const titleEl = document.querySelector("title");
  if (titleEl) {
    new MutationObserver(checkTitle).observe(titleEl, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  // Fallback poll in case the observer misses a change
  setInterval(checkTitle, POLL_INTERVAL_MS);
}

// Delay init to let Slack's SPA finish loading
setTimeout(init, INIT_DELAY_MS);
