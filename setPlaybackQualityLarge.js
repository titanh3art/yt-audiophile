(function () {
  try {
    const player = document.getElementById("movie_player");
    if (!player || typeof player.setPlaybackQualityRange !== "function") {
      console.warn("[YouTube Audiophile] Player API not available");
      return;
    }

    // Get available quality levels and set to highest quality <= 1080p
    const availableLevels = player.getAvailableQualityLevels();
    if (availableLevels && availableLevels.length > 0) {
      // Quality levels ordered from highest to lowest
      // Find highest quality that's 1080p or below
      const qualityPreferences = ["hd1080", "hd720", "large", "medium", "small"];
      let targetQuality = null;

      for (const pref of qualityPreferences) {
        if (availableLevels.includes(pref)) {
          targetQuality = pref;
          break;
        }
      }

      // If no preferred quality found, use the highest available (but not 4K)
      if (!targetQuality) {
        // Filter out 4K qualities, find highest remaining
        const non4KLevels = availableLevels.filter(level => !level.includes("2160") && !level.includes("1440"));
        targetQuality = non4KLevels.length > 0 ? non4KLevels[0] : availableLevels[0];
      }

      player.setPlaybackQualityRange(targetQuality, targetQuality);
      player.setPlaybackQuality(targetQuality);
      console.log("[YouTube Audiophile] Set quality to:", targetQuality);
    } else {
      // Fallback to hd1080 or large
      try {
        player.setPlaybackQualityRange("hd1080", "hd1080");
        player.setPlaybackQuality("hd1080");
      } catch {
        player.setPlaybackQualityRange("large", "large");
        player.setPlaybackQuality("large");
      }
    }
  } catch (error) {
    console.warn("[YouTube Audiophile] Error setting high quality:", error);
  }
})();
