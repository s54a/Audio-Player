import "./style.css";

const urlInput = document.getElementById("urlInput");
const playButton = document.getElementById("playButton");
const audioPlayer = document.getElementById("audioPlayer");
const errorMessage = document.getElementById("errorMessage");
const savedUrl = localStorage.getItem("audioUrl");
const savedTime = localStorage.getItem("audioTime");

// Fade configuration
const FADE_DURATION = 1000; // Duration of fade in milliseconds
const FADE_INTERVAL = 50; // How often to update volume during fade (milliseconds)
let fadeTimeout = null;

// Load saved URL and playback time from localStorage on page load
window.addEventListener("DOMContentLoaded", () => {
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
});

// Save the current playback time in localStorage as the song plays
audioPlayer.addEventListener("timeupdate", () => {
  localStorage.setItem("audioTime", audioPlayer.currentTime);
});

function fadeOut(onComplete) {
  const steps = FADE_DURATION / FADE_INTERVAL;
  const volumeStep = audioPlayer.volume / steps;

  const fade = () => {
    if (audioPlayer.volume > volumeStep) {
      audioPlayer.volume -= volumeStep;
      fadeTimeout = setTimeout(fade, FADE_INTERVAL);
    } else {
      audioPlayer.volume = 0;
      if (onComplete) onComplete();
    }
  };

  fade();
}

function fadeIn() {
  const targetVolume = 1.0;
  const steps = FADE_DURATION / FADE_INTERVAL;
  const volumeStep = targetVolume / steps;

  const fade = () => {
    if (audioPlayer.volume < targetVolume - volumeStep) {
      audioPlayer.volume += volumeStep;
      fadeTimeout = setTimeout(fade, FADE_INTERVAL);
    } else {
      audioPlayer.volume = targetVolume;
    }
  };

  fade();
}

async function playAudio(url) {
  // Clear any existing fade
  if (fadeTimeout) {
    clearTimeout(fadeTimeout);
  }

  // If audio is currently playing, fade it out first
  if (!audioPlayer.paused) {
    await new Promise((resolve) => {
      fadeOut(() => {
        audioPlayer.pause();
        resolve();
      });
    });
  }

  // Reset volume to 0 for fade-in
  audioPlayer.volume = 0;

  // Clear the saved playback time in localStorage
  localStorage.removeItem("audioTime");

  // Set the audio source and ensure loop is set
  audioPlayer.src = url;
  audioPlayer.loop = true;

  // When the metadata is loaded, reset the playback time and play with fade-in
  audioPlayer.addEventListener("loadedmetadata", () => {
    audioPlayer.currentTime = 0;
    audioPlayer
      .play()
      .then(() => {
        fadeIn();
      })
      .catch((error) => {
        errorMessage.textContent = `Error playing audio: ${error.message}`;
      });
  });
}

// Play button click handler
playButton.addEventListener("click", () => {
  const audioUrl = urlInput.value.trim();

  if (!audioUrl) {
    errorMessage.textContent = "Please enter a URL";
    return;
  }

  // Save the URL to localStorage
  localStorage.setItem("audioUrl", audioUrl);

  // Call the playAudio function
  playAudio(audioUrl);
});

// Input field event handlers
urlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    playButton.click();
    urlInput.blur();
  }

  if (event.ctrlKey && event.key === "v") {
    setTimeout(() => {
      playButton.click();
      urlInput.blur();
    }, 100);
  }
});

// Error handling for audio element
audioPlayer.addEventListener("error", (e) => {
  errorMessage.textContent =
    "Unable to load or play the audio file. Check the URL and file access.";
});

// // Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.key === "/") {
    event.preventDefault();
    urlInput.focus();
    urlInput.value = "";
  } else if (event.key === "Escape") {
    urlInput.blur();
    urlInput.value = savedUrl;
  } else if (event.code === "Space") {
    event.preventDefault();
    if (audioPlayer.paused) {
      audioPlayer.volume = 0;
      audioPlayer.play().then(() => fadeIn());
    } else {
      fadeOut(() => audioPlayer.pause());
    }
  }
});

document.addEventListener("paste", function (e) {
  // This will work when user manually pastes
  const text = e.clipboardData.getData("text");
  e.preventDefault();
  urlInput.focus();
  urlInput.value = "";
  urlInput.value = text;
  setTimeout(() => {
    playButton.click();
    urlInput.blur();
  }, 10);
});

// Add functionality to hide/unhide the container div and control volume with arrow keys
const container = document.querySelector(".container");
let isContainerVisible = true;

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    // Volume Up
    audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1);
  } else if (event.key === "ArrowDown") {
    // Volume Down
    audioPlayer.volume = Math.max(audioPlayer.volume - 0.1, 0);
  }
  // else if (event.key === "e") {
  //   // Toggle hide/unhide for the container div
  //   isContainerVisible = !isContainerVisible;
  //   container.style.visibility = isContainerVisible ? "visible" : "hidden";
  // }
});

// // Initial setup: container should be hidden by default and fade out after a delay
// let hideTimeout;

// // Add event listeners for mouse hover functionality
// container.addEventListener("mouseenter", () => {
//   // Ensure the container is visible when hovered
//   container.style.visibility = "visible";
//   container.style.opacity = "1";
//   console.log("enter");
//   // Reset the timer when hovering to prevent auto-hide
//   clearTimeout(hideTimeout);
// });

// container.addEventListener("mouseleave", () => {
//   console.log("leave");
//   container.style.opacity = "0";
//   container.style.visibility = "hidden";
//   // Set a timer to hide the container after a delay if not hovered
//   // hideTimeout = setTimeout(() => {
//   // setTimeout(() => {
//   // }, 500); // Match the CSS transition duration
//   // }, 2000); // Hide the container after 2 seconds of no hover
// });

// setTimeout(() => {
//   container.style.visibility = "hidden";
//   container.style.opacity = "0";
// }, 2000); // Set the initial delay for the container to be hidden

// import "./style.css";
// import { setupEventListeners } from "./utils/eventHandlers";

// const urlInput = document.getElementById("urlInput");
// const playButton = document.getElementById("playButton");
// const audioPlayer = document.getElementById("audioPlayer");
// const errorMessage = document.getElementById("errorMessage");

// // Initialize the application by setting up event listeners
// setupEventListeners(audioPlayer, urlInput, playButton, errorMessage);

// // Add functionality to hide/unhide the container div and control volume with arrow keys
// const container = document.querySelector(".container");
// let isContainerVisible = true;

// document.addEventListener("keydown", (event) => {
//   if (event.key === "ArrowUp") {
//     // Volume Up
//     audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1);
//   } else if (event.key === "ArrowDown") {
//     // Volume Down
//     audioPlayer.volume = Math.max(audioPlayer.volume - 0.1, 0);
//   } else if (event.key === "e") {
//     // Toggle hide/unhide for the container div
//     isContainerVisible = !isContainerVisible;
//     container.style.visibility = isContainerVisible ? "visible" : "hidden";
//   }
// });
