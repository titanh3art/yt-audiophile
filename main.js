class YouTubeAudiophile {
  static isActive = false;
  static videoObserver = null;
  static toggleDebounceTimer = null;
  static cachedElements = new Map();

  static activate() {
    this.isActive = true;

    // Debounce rapid toggles
    if (this.toggleDebounceTimer) {
      clearTimeout(this.toggleDebounceTimer);
    }

    this.toggleDebounceTimer = setTimeout(() => {
      this._performActivate();
    }, 100);
  }

  static _performActivate() {
    try {
      // Reuse script element for performance
      this.injectScript("setPlaybackQualityTiny.js");
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

    // Debounce rapid toggles
    if (this.toggleDebounceTimer) {
      clearTimeout(this.toggleDebounceTimer);
    }

    this.toggleDebounceTimer = setTimeout(() => {
      this._performDeactivate();
    }, 100);
  }

  static _performDeactivate() {
    try {
      // Reuse script element for performance
      this.injectScript("setPlaybackQualityLarge.js");
    } catch (error) {
      console.warn("[YouTube Audiophile] Error setting quality:", error);
    }

    // Show current video
    this.showCurrentVideo();

    // Stop observing videos
    this.stopVideoObserver();
  }

  static injectScript(scriptName) {
    // Reuse existing script element if possible
    let script = this.cachedElements.get(scriptName);
    if (!script) {
      script = document.createElement("script");
      script.src = chrome.runtime.getURL(scriptName);
      this.cachedElements.set(scriptName, script);
    }

    // Remove and re-add to ensure execution
    if (script.parentNode) {
      script.remove();
    }
    document.documentElement.appendChild(script);
    script.onload = () => script.remove();
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

    let mutationCount = 0;
    this.videoObserver = new MutationObserver((mutations) => {
      if (!this.isActive) return;

      // Limit processing to avoid performance issues
      if (mutationCount++ > 100) {
        console.warn("[YouTube Audiophile] Too many mutations, throttling observer");
        return;
      }

      // Reset counter periodically
      if (mutationCount > 50) {
        setTimeout(() => { mutationCount = 0; }, 1000);
      }

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "VIDEO") {
              // Direct video element added
              if (node.style.display !== "none") {
                this.hideVideoElement(node);
              }
            } else if (node.querySelectorAll) {
              // Check for videos in added subtree
              const videos = node.querySelectorAll("video");
              videos.forEach(video => {
                if (video.style.display !== "none") {
                  this.hideVideoElement(video);
                }
              });
            }
          }
        }
      }
    });

    // Observe specific containers more efficiently
    const targets = [
      document.getElementById("movie_player"),
      document.querySelector("#player"),
      document.querySelector("#player-container")
    ].filter(Boolean);

    // If no specific targets found, observe a more targeted selector
    if (targets.length === 0) {
      const playerContainer = document.querySelector('[class*="player"], [id*="player"]');
      if (playerContainer) {
        targets.push(playerContainer);
      }
    }

    // Observe each target with optimized settings
    targets.forEach(target => {
      this.videoObserver.observe(target, {
        childList: true,
        subtree: true,
        attributes: false, // Don't watch attribute changes for performance
        characterData: false
      });
    });

    // Fallback: observe ytd-app if no specific targets
    if (targets.length === 0) {
      const ytdApp = document.querySelector("ytd-app");
      if (ytdApp) {
        this.videoObserver.observe(ytdApp, {
          childList: true,
          subtree: false // Don't go deep to avoid performance issues
        });
      }
    }

    console.log("[YouTube Audiophile] Started optimized video observer");
  }

  static hideVideoElement(video) {
    // Use requestIdleCallback for non-critical operations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        video.style.display = "none";
        video.setAttribute("aria-hidden", "true");
        console.log("[YouTube Audiophile] Video hidden via observer");
      });
    } else {
      video.style.display = "none";
      video.setAttribute("aria-hidden", "true");
      console.log("[YouTube Audiophile] Video hidden via observer");
    }
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

  // Enhanced element detection with multiple selectors
  const logoSelectors = [
    "#logo", // Current standard
    "ytd-masthead #logo", // More specific
    ".ytd-masthead #logo", // Alternative class-based
    "[aria-label*='YouTube']", // Accessibility-based
    "a[href='/'] img[alt*='YouTube']", // Logo link fallback
    "#masthead #logo" // Alternative masthead selector
  ];

  let logoContainer = null;
  for (const selector of logoSelectors) {
    logoContainer = document.querySelector(selector);
    if (logoContainer) {
      // Additional validation - make sure it's in the header area
      const masthead = logoContainer.closest("#masthead, ytd-masthead, .ytd-masthead");
      if (masthead) break;
    }
  }

  if (!logoContainer) {
    if (retryCount < 50) { // Max 50 retries (~5 seconds at 60fps)
      requestAnimationFrame(() => addYtAudiophileToggle(retryCount + 1));
    } else {
      console.warn("[YouTube Audiophile] Could not find YouTube logo container after retries with all selectors");
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
