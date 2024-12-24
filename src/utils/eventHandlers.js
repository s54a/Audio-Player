import { fadeIn, fadeOut, playAudio } from "./audioControl.js";
import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
} from "./storage.js";

// Event listeners for user interactions

export function setupEventListeners(
  audioPlayer,
  urlInput,
  playButton,
  errorMessage
) {
  const savedUrl = getFromLocalStorage("audioUrl");
  const savedTime = getFromLocalStorage("audioTime");

  // Load saved URL and playback time
  if (savedUrl) {
    urlInput.value = savedUrl;
    audioPlayer.src = savedUrl;
    audioPlayer.loop = true;

    audioPlayer.addEventListener("loadedmetadata", () => {
      if (savedTime) {
        audioPlayer.currentTime = parseFloat(savedTime);
      }
    });
  }

  // Save playback time as the audio plays
  audioPlayer.addEventListener("timeupdate", () => {
    saveToLocalStorage("audioTime", audioPlayer.currentTime);
  });

  // Handle play button click
  playButton.addEventListener("click", () => {
    const audioUrl = urlInput.value.trim();

    if (!audioUrl) {
      errorMessage.textContent = "Please enter a URL";
      return;
    }

    saveToLocalStorage("audioUrl", audioUrl);
    playAudio(audioPlayer, audioUrl);
  });

  // Handle keyboard shortcuts and input events
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      playButton.click();
      urlInput.blur();
    } else if (event.key === "Space") {
      event.preventDefault();
      if (audioPlayer.paused) {
        audioPlayer.volume = 0;
        audioPlayer.play().then(() => fadeIn(audioPlayer));
      } else {
        fadeOut(audioPlayer, () => audioPlayer.pause());
      }
    } else if (event.key === "/") {
      event.preventDefault();
      urlInput.focus();
      urlInput.value = "";
    }
  });

  document.addEventListener("paste", (event) => {
    const text = event.clipboardData.getData("text");
    urlInput.value = text;
    playButton.click();
  });

  urlInput.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "v") {
      setTimeout(() => {
        playButton.click();
        urlInput.blur();
      }, 100);
    }
  });
}
