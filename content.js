/**
 * Slack PWA - Content Script
 * Injects PWA manifest and monitors Slack for unread notifications.
 */

// Inject PWA manifest so Slack can be installed as a standalone app
const manifestLink = document.createElement("link");
manifestLink.rel = "manifest";
manifestLink.href =
  "https://raw.githubusercontent.com/gxanshu/slack-pwa/main/pwa/pwa-manifest.json";
document.head.appendChild(manifestLink);

/**
 * Extract unread notification count from Slack's document title.
 * Slack uses patterns like "(3) Slack", "3 channel", "[3] Slack", or "\u2022 Slack".
 * Returns: positive number for count, 0 for indicator-only, -1 for none.
 */
function getNotificationCount(title) {
  const t = title.trim();
  const m =
    t.match(/^\((\d+)\)/) || t.match(/^(\d+)\s/) || t.match(/^\[(\d+)\]/);
  if (m) return parseInt(m[1], 10);
  if (t.startsWith("\u2022")) return 0;
  return -1;
}

let lastCount = -1;

function checkTitle() {
  const count = getNotificationCount(document.title);
  if (count === lastCount) return;

  const wasQuiet = lastCount < 0;
  lastCount = count;

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

  // Send initial badge state to service worker
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
  setInterval(checkTitle, 1000);
}

// Delay init to let Slack's SPA finish loading
setTimeout(init, 2000);
