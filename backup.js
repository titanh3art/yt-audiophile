// Keep track of last processed video
let lastVideo = null;

// Core optimization logic
function optimizeForAudioOnly() {
  const player = document.getElementById("movie_player");
  const video = document.querySelector("video");

  if (!video || video === lastVideo) return; // Already optimized

  // 1️⃣ Force video quality to 144p
  if (player && typeof player.setPlaybackQualityRange === "function") {
    player.setPlaybackQualityRange("tiny", "tiny");
    player.setPlaybackQuality("tiny");
    console.log("[Audio Optimizer] Forced video quality: 144p");
  }

  // 2️⃣ Hide video but keep audio
  video.style.visibility = "hidden";
  video.style.width = "1px";
  video.style.height = "1px";
  video.style.position = "absolute";
  video.style.top = "0";
  video.style.left = "0";

  lastVideo = video;
}

// -----------------------
// MutationObserver setup
// -----------------------

// Observe the #movie_player element (closest stable parent of <video>)
function observeVideoContainer() {
  const container = document.getElementById("movie_player");
  if (!container) return;

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        if (
          node.tagName === "VIDEO" ||
          (node.querySelector && node.querySelector("video"))
        ) {
          optimizeForAudioOnly();
          return; // Exit early once a video is detected
        }
      }
    }
  });

  observer.observe(container, { childList: true, subtree: true });
}

// -----------------------
// Initial run
// -----------------------
optimizeForAudioOnly();
observeVideoContainer();
