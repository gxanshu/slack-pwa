async function ensureOffscreen() {
  try {
    const exists = await chrome.offscreen.hasDocument?.();
    if (exists) {
      console.log("Slack PWA: Offscreen document already exists");
      return;
    }

    console.log("Slack PWA: Creating offscreen document for audio playback");
    await chrome.offscreen.createDocument({
      url: "pwa/offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play notification sounds when Slack tab is not focused.",
    });
    console.log("Slack PWA: Offscreen document created successfully");
  } catch (error) {
    console.error("Slack PWA: Failed to create offscreen document:", error);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(
    "Slack PWA: Service worker received message:",
    msg,
    "from:",
    sender.tab?.url,
  );

  if (msg?.type === "SLACK_UNREAD_PING") {
    console.log("Slack PWA: Processing notification ping");
    (async () => {
      try {
        await ensureOffscreen();
        console.log(
          "Slack PWA: Sending PLAY_DING message to offscreen document",
        );
        await chrome.runtime.sendMessage({ type: "PLAY_DING" });
      } catch (error) {
        console.error("Slack PWA: Error handling notification ping:", error);
      }
    })();
  }

  // returning false: no async sendResponse
  return false;
});
