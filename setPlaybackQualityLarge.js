(function () {
  try {
    const player = document.getElementById("movie_player");
    if (!player || typeof player.setPlaybackQualityRange !== "function") {
      console.warn("[YouTube Audiophile] Player API not available");
      return;
    }

    // Get available quality levels and set to higher quality (480p or medium)
    const availableLevels = player.getAvailableQualityLevels();
    if (availableLevels && availableLevels.length > 0) {
      // Try to find 'large' (480p), or 'medium' (360p), or something in between
      let targetQuality = "large";
      if (!availableLevels.includes("large")) {
        // Find medium quality (around 360p-480p)
        const preferredLevels = ["large", "medium", "small"];
        targetQuality = preferredLevels.find(level => availableLevels.includes(level)) || availableLevels[Math.floor(availableLevels.length / 2)];
      }
      player.setPlaybackQualityRange(targetQuality, targetQuality);
      player.setPlaybackQuality(targetQuality);
      console.log("[YouTube Audiophile] Set quality to:", targetQuality);
    } else {
      // Fallback to large
      player.setPlaybackQualityRange("large", "large");
      player.setPlaybackQuality("large");
    }
  } catch (error) {
    console.warn("[YouTube Audiophile] Error setting high quality:", error);
  }
})();
