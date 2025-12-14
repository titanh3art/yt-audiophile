class YouTubeAudiophile {
  static videoObserver = null;
  static toggleDebounceTimer = null;

  static activate() {
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
      this.injectScript("setPlaybackQualityTiny.js");
    } catch (error) {
      console.warn("[YouTube Audiophile] Error injecting script:", error);
    }

    // Hide current video
    this.hideCurrentVideo();

    // Start observing for new VIDEO element
    this.startVideoObserver();

    // Hide existing thumbnails
    this.hideExistingThumbnails();
  }

  static deactivate() {
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
      this.injectScript("setPlaybackQualityLarge.js");
    } catch (error) {
      console.warn("[YouTube Audiophile] Error injecting script:", error);
    }

    // Show current video
    this.showCurrentVideo();

    // Stop observing for new VIDEO element
    this.stopVideoObserver();

    // Restore all hidden thumbnails
    this.restoreThumbnails();
  }

  static injectScript(scriptName) {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(scriptName);
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
      // Limit processing to avoid performance issues
      if (mutationCount++ > 100) {
        console.warn(
          "[YouTube Audiophile] Too many mutations, throttling observer"
        );
        return;
      }

      // Reset counter periodically
      if (mutationCount > 50) {
        setTimeout(() => {
          mutationCount = 0;
        }, 1000);
      }

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.tagName === "VIDEO"
            ) {
              this.activate();
            }
          }
        }
      }
    });

    const target = document.getElementById("movie_player");

    if (target) {
      this.videoObserver.observe(target, {
        childList: true,
        subtree: true,
        attributes: false, // Don't watch attribute changes for performance
        characterData: false,
      });
      console.log("[YouTube Audiophile] Started new VIDEO element observer");
    }
  }

  static stopVideoObserver() {
    if (this.videoObserver) {
      this.videoObserver.disconnect();
      this.videoObserver = null;
      console.log("[YouTube Audiophile] Stopped video observer");
    }
  }

  static hideExistingThumbnails() {
    // Find thumbnail images using multiple selectors
    const thumbnailSelectors = [
      "img.yt-core-image", // New YouTube design
      'img[src*="vi"]', // Video ID thumbnails
      "#thumbnail img", // General thumbnail containers
      ".ytd-thumbnail img", // YouTube thumbnail components
      ".yt-simple-endpoint img", // Clickable thumbnail links
      'a[href*="/watch"] img', // Watch page links with images
    ];

    thumbnailSelectors.forEach((selector) => {
      const thumbnails = document.querySelectorAll(selector);
      thumbnails.forEach((img) => {
        if (this.isThumbnail(img) && !img.hasAttribute("data-original-src")) {
          this.replaceThumbnailWithColor(img);
        }
      });
    });

    // Also check if the element itself is a thumbnail
    if (
      element.tagName === "IMG" &&
      this.isThumbnail(element) &&
      !element.hasAttribute("data-original-src")
    ) {
      this.replaceThumbnailWithColor(element);
    }
  }

  static isThumbnail(img) {
    // Check if this is actually a video thumbnail
    if (!img || !img.src) return false;

    const src = img.src.toLowerCase();
    // YouTube thumbnails contain 'vi/' in the URL
    return (
      src.includes("vi/") ||
      src.includes("ytimg.com") ||
      img.closest(
        '[id*="thumbnail"], [class*="thumbnail"], .ytd-rich-grid-media, .ytd-video-meta-block'
      )
    );
  }

  static replaceThumbnailWithColor(img) {
    // Store original source for restoration
    if (!img.hasAttribute("data-original-src")) {
      img.setAttribute("data-original-src", img.src);
      img.setAttribute("data-original-display", img.style.display || "");
    }

    // Hide the image and set background color on parent container
    img.style.display = "none";

    // Find the thumbnail container and set background
    const container =
      img.closest('a, .ytd-thumbnail, [class*="thumbnail"]') ||
      img.parentElement;
    if (container) {
      container.style.backgroundColor = "#000000ff";
      container.style.display = "block";
      container.setAttribute("data-thumbnail-hidden", "true");
    }
  }

  static restoreThumbnails() {
    // Find all hidden thumbnails and restore them
    const hiddenImages = document.querySelectorAll("img[data-original-src]");
    hiddenImages.forEach((img) => {
      // Restore original source
      if (img.hasAttribute("data-original-src")) {
        img.src = img.getAttribute("data-original-src");
        img.style.display = img.getAttribute("data-original-display") || "";
        img.removeAttribute("data-original-src");
        img.removeAttribute("data-original-display");
      }
    });

    // Remove background colors from containers
    const hiddenContainers = document.querySelectorAll(
      "[data-thumbnail-hidden]"
    );
    hiddenContainers.forEach((container) => {
      container.style.backgroundColor = "";
      container.removeAttribute("data-thumbnail-hidden");
    });
  }

  static async loadState() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["audiophileEnabled"], (result) => {
        resolve(result.audiophileEnabled || false);
      });
    });
  }

  static saveState(enabled) {
    chrome.storage.sync.set({ audiophileEnabled: enabled });
  }
}

const TOGGLE_CONTAINER_ID = "yt-audiophile-toggle";
const TITLE = "Audiophile";
const TOOLTIP = "YouTube Audiophile - Browser Extension";

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
    "#masthead #logo", // Alternative masthead selector
  ];

  let logoContainer = null;
  for (const selector of logoSelectors) {
    logoContainer = document.querySelector(selector);
    if (logoContainer) {
      // Additional validation - make sure it's in the header area
      const masthead = logoContainer.closest(
        "#masthead, ytd-masthead, .ytd-masthead"
      );
      if (masthead) break;
    }
  }

  if (!logoContainer) {
    if (retryCount < 100) {
      // Max 100 retries (~10 seconds at 60fps)
      requestAnimationFrame(() => addYtAudiophileToggle(retryCount + 1));
    } else {
      console.warn(
        "[YouTube Audiophile] Could not find YouTube logo container after retries with all selectors"
      );
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
  toggleContainer.style.flexShrink = "0"; // Prevent container from shrinking

  // Create label and switch
  toggleContainer.innerHTML = `
    <span style="font-size:13px; color: var(--yt-spec-text-primary, #fff); margin-right:6px;">
      ${TITLE}
    </span>
    <span class="yt-audiophile-help-icon" title="${TOOLTIP}">?</span>
    <label class="yt-audiophile-switch">
      <input type="checkbox" id="yt-audiophile-checkbox" ${
        isEnabled ? "checked" : ""
      }>
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

addYtAudiophileToggle();
