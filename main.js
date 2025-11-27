class YouTubeAudiophile {
  static activate() {
    try {
      // Set video quality to lowest available (typically 144p)
      const s = document.createElement("script");
      s.src = chrome.runtime.getURL("setPlaybackQualityTiny.js");
      document.documentElement.appendChild(s);
      s.onload = () => s.remove();
    } catch (error) {
      console.warn("[YouTube Audiophile] Error setting quality:", error);
    }

    // Hide video with better CSS
    const video = document.querySelector("video");
    if (!video) {
      console.warn("[YouTube Audiophile] Video element not found");
      return;
    }
    video.style.display = "none"; // More effective than visibility: hidden
    video.setAttribute("aria-hidden", "true");
  }

  static deactivate() {
    try {
      // Set video quality to higher quality (480p or available)
      const s = document.createElement("script");
      s.src = chrome.runtime.getURL("setPlaybackQualityLarge.js");
      document.documentElement.appendChild(s);
      s.onload = () => s.remove();
    } catch (error) {
      console.warn("[YouTube Audiophile] Error setting quality:", error);
    }

    // Show video
    const video = document.querySelector("video");
    if (!video) {
      console.warn("[YouTube Audiophile] Video element not found");
      return;
    }
    video.style.display = ""; // Reset display
    video.setAttribute("aria-hidden", "false");
  }

  static async loadState() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['audiophileEnabled'], (result) => {
        resolve(result.audiophileEnabled || false);
      });
    });
  }

  static saveState(enabled) {
    chrome.storage.sync.set({ audiophileEnabled: enabled });
  }
}

const TOGGLE_CONTAINER_ID = "yt-audiophile-toggle";
const TITLE = "YouTube Audiophile (Extension)";

async function addYtAudiophileToggle(retryCount = 0) {
  // Avoid duplicates if user navigates within YouTube
  if (document.getElementById(TOGGLE_CONTAINER_ID)) return;

  // Wait for YouTube logo container to appear with retry logic
  const logoContainer = document.querySelector("#logo");

  if (!logoContainer) {
    if (retryCount < 50) { // Max 50 retries (~5 seconds at 60fps)
      requestAnimationFrame(() => addYtAudiophileToggle(retryCount + 1));
    } else {
      console.warn("[YouTube Audiophile] Could not find YouTube logo container after retries");
    }
    return;
  }

  // Load saved state
  const isEnabled = await YouTubeAudiophile.loadState();

  // Create toggle container
  const toggleContainer = document.createElement("div");
  toggleContainer.id = TOGGLE_CONTAINER_ID;
  toggleContainer.style.display = "flex";
  toggleContainer.style.alignItems = "center";
  toggleContainer.style.marginLeft = "12px";
  toggleContainer.style.cursor = "pointer";
  toggleContainer.title = TITLE;

  // Create label and switch
  toggleContainer.innerHTML = `
    <span style="font-size:13px; color: var(--yt-spec-text-primary, #fff); margin-right:6px;">
      ${TITLE}
    </span>
    <label class="yt-audiophile-switch">
      <input type="checkbox" id="yt-audiophile-checkbox" ${isEnabled ? 'checked' : ''}>
      <span class="yt-audiophile-slider"></span>
    </label>
  `;

  logoContainer.parentNode.insertBefore(
    toggleContainer,
    logoContainer.nextSibling
  );

  const checkbox = toggleContainer.querySelector("#yt-audiophile-checkbox");

  // Apply initial state
  if (isEnabled) {
    YouTubeAudiophile.activate();
  }

  checkbox.addEventListener("change", () => {
    const enabled = checkbox.checked;
    YouTubeAudiophile.saveState(enabled);
    if (enabled) {
      YouTubeAudiophile.activate();
    } else {
      YouTubeAudiophile.deactivate();
    }
  });

  // Add keyboard shortcut (Ctrl+Shift+A)
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === "A") {
      event.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change"));
    }
  });
}

// Run initially and on navigation
addYtAudiophileToggle();
new MutationObserver(() => addYtAudiophileToggle()).observe(document.body, {
  childList: true,
  subtree: true,
});
