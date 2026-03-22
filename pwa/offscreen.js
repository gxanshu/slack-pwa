/**
 * Slack PWA - Offscreen Audio
 * Plays notification sound with rate limiting.
 */

const MIN_GAP_MS = 2000;
const AUDIO_LOAD_DELAY_MS = 100;
const AUDIO_REINIT_DELAY_MS = 1000;

let audio;
let lastPlay = 0;
let ready = false;

function initAudio() {
  audio = new Audio(chrome.runtime.getURL("assets/notify.mp3"));
  audio.preload = "auto";
  audio.volume = 1.0;
  audio.addEventListener("canplaythrough", () => (ready = true));
  audio.addEventListener("error", () => (ready = false));
}

async function play() {
  if (Date.now() - lastPlay < MIN_GAP_MS) return;

  if (!audio || !ready) {
    initAudio();
    await new Promise((resolve) => setTimeout(resolve, AUDIO_LOAD_DELAY_MS));
  }

  lastPlay = Date.now();
  try {
    audio.currentTime = 0;
    await audio.play();
  } catch {
    ready = false;
    setTimeout(initAudio, AUDIO_REINIT_DELAY_MS);
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "PLAY_DING") play();
});

initAudio();
