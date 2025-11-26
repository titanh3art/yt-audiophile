(function () {
  const player = document.getElementById("movie_player");
  if (player && typeof player.setPlaybackQualityRange === "function") {
    player.setPlaybackQualityRange("tiny", "tiny");
  }
})();
