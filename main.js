function addAudioModeToggle() {
  // Avoid duplicates if user navigates within YouTube
  if (document.getElementById("audio-mode-toggle")) return;

  // Wait for YouTube logo container to appear
  const logoContainer = document.querySelector("#logo");

  if (!logoContainer) {
    requestAnimationFrame(addAudioModeToggle);
    return;
  }

  // Create toggle container
  const toggleContainer = document.createElement("div");
  toggleContainer.id = "audio-mode-toggle";
  toggleContainer.style.display = "flex";
  toggleContainer.style.alignItems = "center";
  toggleContainer.style.marginLeft = "12px";
  toggleContainer.style.cursor = "pointer";
  toggleContainer.title = "Toggle Audio Mode";

  // Create label and switch
  toggleContainer.innerHTML = `
    <span style="font-size:13px; color: var(--yt-spec-text-primary, #fff); margin-right:6px;">
      Audio Mode
    </span>
    <label class="yt-audio-switch">
      <input type="checkbox" id="audioModeCheckbox">
      <span class="yt-audio-slider"></span>
    </label>
  `;

  logoContainer.parentNode.insertBefore(
    toggleContainer,
    logoContainer.nextSibling
  );

  const checkbox = toggleContainer.querySelector("#audioModeCheckbox");

  checkbox.addEventListener("change", () => {
    const enabled = checkbox.checked;
    // window.postMessage({ type: 'AUDIO_MODE_TOGGLE', enabled }, '*');
    console.log("AUDIO_MODE_TOGGLE", enabled);
  });
}

// Run initially and on navigation
addAudioModeToggle();
new MutationObserver(() => addAudioModeToggle()).observe(document.body, {
  childList: true,
  subtree: true,
});
