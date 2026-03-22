/**
 * Slack PWA - Service Worker
 * Updates the extension icon badge and plays notification sounds.
 * The primary PWA badge is set by badge.js (MAIN world content script).
 * This service worker provides a fallback badge + extension icon badge.
 */

const BADGE_COLOR = "#E01E5A";

// Fallback: inject badge update into MAIN world via scripting API.
// Primary badge is set by badge.js content script; this covers edge cases
// where the MAIN world content script hasn't loaded yet.
async function updatePwaBadge(tabId, count) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func: (c) => {
        if (typeof navigator.setAppBadge !== "function") return;
        if (c > 0) navigator.setAppBadge(c).catch(() => {});
        else if (c === 0) navigator.setAppBadge().catch(() => {});
        else navigator.clearAppBadge().catch(() => {});
      },
      args: [count],
    });
  } catch {
    // Tab may have closed or navigated away
  }
}

// Update the extension toolbar icon badge.
// This serves as a visible fallback on platforms where navigator.setAppBadge()
// doesn't produce OS-level badges (e.g. Linux/GNOME).
function updateExtensionBadge(tabId, count) {
  try {
    if (count > 0) {
      chrome.action.setBadgeText({ text: String(count), tabId });
      chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR, tabId });
    } else if (count === 0) {
      chrome.action.setBadgeText({ text: "•", tabId });
      chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR, tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  } catch {
    // action API may not be available
  }
}

// Offscreen document management for audio playback (MV3 requirement)
async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument?.()) return;
  await chrome.offscreen.createDocument({
    url: "pwa/offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play notification sounds for Slack messages.",
  });
}

async function playSound() {
  try {
    await ensureOffscreen();
    await chrome.runtime.sendMessage({ type: "PLAY_DING" });
  } catch {
    // Offscreen document may not be ready yet
  }
}

// Handle messages from the content script
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type !== "NOTIFICATION_UPDATE" || !sender.tab?.id) return;

  updatePwaBadge(sender.tab.id, msg.count);
  updateExtensionBadge(sender.tab.id, msg.count);
  if (msg.playSound) playSound();
});
