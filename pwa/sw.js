/**
 * Slack PWA - Service Worker
 * Updates the PWA app badge and plays notification sounds.
 */

// Update the PWA badge by injecting into the page's MAIN world.
// This guarantees the Badging API targets the installed PWA, not the extension.
async function updateBadge(tabId, count) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func: (c) => {
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

  updateBadge(sender.tab.id, msg.count);
  if (msg.playSound) playSound();
});
