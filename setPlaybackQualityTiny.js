(function () {
  try {
    const player = document.getElementById("movie_player");
    if (!player || typeof player.setPlaybackQualityRange !== "function") {
      console.warn("[YouTube Audiophile] Player API not available");
      return;
    }

    // Get available quality levels and set to lowest
    const availableLevels = player.getAvailableQualityLevels();
    if (availableLevels && availableLevels.length > 0) {
      const lowestQuality = availableLevels[availableLevels.length - 2]; // Last is "auto", second to last is lowest
      player.setPlaybackQualityRange(lowestQuality, lowestQuality);
      player.setPlaybackQuality(lowestQuality);
      console.debug("[YouTube Audiophile] Set quality to:", lowestQuality);
    } else {
      // Fallback to tiny
      player.setPlaybackQualityRange("tiny", "tiny");
      player.setPlaybackQuality("tiny");
    }
  } catch (error) {
    console.warn("[YouTube Audiophile] Error setting low quality:", error);
  }
})();
