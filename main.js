class YouTubeAudiophile {
  static activate() {
    // Set video quality to tiny (144p)
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("setPlaybackQualityTiny.js");
    document.documentElement.appendChild(s);
    s.onload = () => s.remove();

    // Hide video
    const video = document.querySelector("video");
    if (!video) return;
    video.style.visibility = "hidden";
  }

  static deactivate() {
    // Set video quality to large (480p)
    // Setting the range from lowest to highest available using player.getAvailableQualityLabels() or getAvailableQualityLevels() is not working
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("setPlaybackQualityLarge.js");
    document.documentElement.appendChild(s);
    s.onload = () => s.remove();

    // Show video
    const video = document.querySelector("video");
    if (!video) return;
    video.style.visibility = "visible";
  }
}

const TOGGLE_CONTAINER_ID = "yt-audiophile-toggle";
const TITLE = "YouTube Audiophile (Extension)";

function addYtAudiophileToggle() {
  // Avoid duplicates if user navigates within YouTube
  if (document.getElementById(TOGGLE_CONTAINER_ID)) return;

  // Wait for YouTube logo container to appear
  const logoContainer = document.querySelector("#logo");

  if (!logoContainer) {
    requestAnimationFrame(addYtAudiophileToggle);
    return;
  }

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
      <input type="checkbox" id="yt-audiophile-checkbox">
      <span class="yt-audiophile-slider"></span>
    </label>
  `;

  logoContainer.parentNode.insertBefore(
    toggleContainer,
    logoContainer.nextSibling
  );

  const checkbox = toggleContainer.querySelector("#yt-audiophile-checkbox");

  checkbox.addEventListener("change", () => {
    const enabled = checkbox.checked;
    if (enabled) {
      YouTubeAudiophile.activate();
    } else {
      YouTubeAudiophile.deactivate();
    }
  });
}

// Run initially and on navigation
addYtAudiophileToggle();
new MutationObserver(() => addYtAudiophileToggle()).observe(document.body, {
  childList: true,
  subtree: true,
});
