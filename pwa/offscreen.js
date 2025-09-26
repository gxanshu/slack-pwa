let audio;
let lastPlay = 0;
const MIN_GAP_MS = 2000;
let audioInitialized = false;

function init() {
  try {
    audio = new Audio(chrome.runtime.getURL("assets/notify.mp3"));
    audio.preload = "auto";
    audio.volume = 1.0;

    // Add event listeners for better debugging
    audio.addEventListener("canplaythrough", () => {
      audioInitialized = true;
      console.log("Slack PWA: Audio initialized and ready to play");
    });

    audio.addEventListener("error", (e) => {
      console.error("Slack PWA: Audio error:", e);
      audioInitialized = false;
    });

    audio.addEventListener("ended", () => {
      console.log("Slack PWA: Notification sound finished playing");
    });
  } catch (e) {
    console.error("Slack PWA: Failed to initialize audio:", e);
  }
}

async function play() {
  const now = Date.now();
  if (now - lastPlay < MIN_GAP_MS) {
    console.log("Slack PWA: Notification sound skipped (too frequent)");
    return;
  }

  if (!audio || !audioInitialized) {
    console.warn("Slack PWA: Audio not ready, reinitializing...");
    init();
    // Wait a bit for initialization
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  lastPlay = now;

  try {
    console.log("Slack PWA: Playing notification sound");
    // Reset audio to start
    audio.currentTime = 0;

    // Try to play the audio
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
      console.log("Slack PWA: Notification sound played successfully");
    }
  } catch (e) {
    console.error("Slack PWA: Audio play failed:", e);

    // Try to reinitialize audio for next time
    setTimeout(() => {
      init();
    }, 1000);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Slack PWA: Received message:", msg);
  if (msg?.type === "PLAY_DING") {
    play().catch((err) => {
      console.error("Slack PWA: Error playing notification:", err);
    });
  }
});

// Initialize audio when the offscreen document loads
document.addEventListener("DOMContentLoaded", init);
init();
