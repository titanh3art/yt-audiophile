class YouTubeAudiophile {
  static isActive = false;
  static videoObserver = null;

  static activate() {
    this.isActive = true;

    try {
      // Set video quality to lowest available (typically 144p)
      const s = document.createElement("script");
      s.src = chrome.runtime.getURL("setPlaybackQualityTiny.js");
      document.documentElement.appendChild(s);
      s.onload = () => s.remove();
    } catch (error) {
      console.warn("[YouTube Audiophile] Error setting quality:", error);
    }

    // Hide current video
    this.hideCurrentVideo();

    // Start observing for new videos if not already
    this.startVideoObserver();
  }

  static deactivate() {
    this.isActive = false;

    try {
      // Set video quality to higher quality (480p or available)
      const s = document.createElement("script");
      s.src = chrome.runtime.getURL("setPlaybackQualityLarge.js");
      document.documentElement.appendChild(s);
      s.onload = () => s.remove();
    } catch (error) {
      console.warn("[YouTube Audiophile] Error setting quality:", error);
    }

    // Show current video
    this.showCurrentVideo();

    // Stop observing videos
    this.stopVideoObserver();
  }

  static hideCurrentVideo() {
    const video = document.querySelector("video");
    if (!video) return;
    video.style.display = "none";
    video.setAttribute("aria-hidden", "true");
  }

  static showCurrentVideo() {
    const video = document.querySelector("video");
    if (!video) return;
    video.style.display = "";
    video.setAttribute("aria-hidden", "false");
  }

  static startVideoObserver() {
    if (this.videoObserver) return; // Already observing

    this.videoObserver = new MutationObserver((mutations) => {
      if (!this.isActive) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if a video element was added
            const videos = node.tagName === "VIDEO" ? [node] :
                          node.querySelectorAll ? node.querySelectorAll("video") : [];
            videos.forEach(video => {
              if (video.style.display !== "none") {
                console.log("[YouTube Audiophile] New video detected, hiding...");
                video.style.display = "none";
                video.setAttribute("aria-hidden", "true");
              }
            });
          }
        }
      }
    });

    // Observe the movie_player container and document body for video changes
    const moviePlayer = document.getElementById("movie_player");
    if (moviePlayer) {
      this.videoObserver.observe(moviePlayer, {
        childList: true,
        subtree: true
      });
    }

    // Also observe the whole document for videos added elsewhere
    this.videoObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log("[YouTube Audiophile] Started video observer");
  }

  static stopVideoObserver() {
    if (this.videoObserver) {
      this.videoObserver.disconnect();
      this.videoObserver = null;
      console.log("[YouTube Audiophile] Stopped video observer");
    }
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
