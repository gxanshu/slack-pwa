/**
 * insert PWA manifest JSON
 */
const metaLink = document.createElement("link");
metaLink.setAttribute("rel", "manifest");
metaLink.setAttribute(
  "href",
  "https://raw.githubusercontent.com/gxanshu/slack-pwa/main/pwa/pwa-manifest.json",
);
document.head.appendChild(metaLink);

/**
 * Monitor title changes for notification sounds
 */
let previousTitle = document.title;
let hasUnreadMessages = false;
let isExtensionReady = false;

// Function to check if title contains notification indicators
function hasNotificationInTitle(title) {
  // Check for patterns like "(1) Slack", "(2) Channel Name", "• Slack", etc.
  const notificationPatterns = [
    /^\(\d+\)/, // (1) pattern
    /^\d+\s/, // "1 " pattern
    /^•/, // bullet point pattern
    /^\[\d+\]/, // [1] pattern
  ];
  return notificationPatterns.some((pattern) => pattern.test(title.trim()));
}

// Function to handle title changes
function onTitleChange() {
  const currentTitle = document.title;

  if (!isExtensionReady) {
    console.log("Slack PWA: Extension not ready yet, skipping notification");
    previousTitle = currentTitle;
    return;
  }

  // Check if we now have notifications when we didn't before
  const currentHasNotifications = hasNotificationInTitle(currentTitle);
  const previousHasNotifications = hasNotificationInTitle(previousTitle);

  console.log("Slack PWA: Title change detected", {
    previous: previousTitle,
    current: currentTitle,
    currentHasNotifications,
    previousHasNotifications,
  });

  // Only play sound when transitioning from no notifications to having notifications
  if (currentHasNotifications && !previousHasNotifications) {
    console.log(
      "Slack PWA: New notification detected, sending ping to service worker",
    );
    // Send message to service worker to play notification sound
    chrome.runtime.sendMessage({ type: "SLACK_UNREAD_PING" }).catch((error) => {
      console.error(
        "Slack PWA: Failed to send message to service worker:",
        error,
      );
    });
  }

  hasUnreadMessages = currentHasNotifications;
  previousTitle = currentTitle;
}

// Wait for page to be fully loaded before starting to monitor
function initializeNotificationMonitoring() {
  console.log("Slack PWA: Initializing notification monitoring");

  // Set up MutationObserver to watch for title changes
  const titleObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "childList" &&
        mutation.target.nodeName === "TITLE"
      ) {
        onTitleChange();
      }
    });
  });

  // Observe the title element for changes
  const titleElement = document.querySelector("title");
  if (titleElement) {
    titleObserver.observe(titleElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    console.log("Slack PWA: Title observer attached");
  }

  // Also use a fallback method to check title periodically
  setInterval(() => {
    if (document.title !== previousTitle) {
      onTitleChange();
    }
  }, 1000);

  // Initialize with current title state
  hasUnreadMessages = hasNotificationInTitle(document.title);
  isExtensionReady = true;
  console.log(
    "Slack PWA: Notification monitoring initialized with title:",
    document.title,
  );
}

// Initialize when DOM is ready and Slack has loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initializeNotificationMonitoring, 2000);
  });
} else {
  setTimeout(initializeNotificationMonitoring, 2000);
}
