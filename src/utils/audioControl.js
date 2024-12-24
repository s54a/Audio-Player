import { FADE_DURATION, FADE_INTERVAL } from "./constants.js";

// Functions to control the audio player

// Fade out the audio
export function fadeOut(audioPlayer, onComplete) {
  const steps = FADE_DURATION / FADE_INTERVAL;
  const volumeStep = audioPlayer.volume / steps;

  const fade = () => {
    if (audioPlayer.volume > volumeStep) {
      audioPlayer.volume -= volumeStep;
      setTimeout(fade, FADE_INTERVAL);
    } else {
      audioPlayer.volume = 0;
      if (onComplete) onComplete();
    }
  };

  fade();
}

// Fade in the audio
export function fadeIn(audioPlayer) {
  const targetVolume = 1.0;
  const steps = FADE_DURATION / FADE_INTERVAL;
  const volumeStep = targetVolume / steps;

  const fade = () => {
    if (audioPlayer.volume < targetVolume - volumeStep) {
      audioPlayer.volume += volumeStep;
      setTimeout(fade, FADE_INTERVAL);
    } else {
      audioPlayer.volume = targetVolume;
    }
  };

  fade();
}

// Play audio with fade-in and fade-out logic
export async function playAudio(audioPlayer, url, savedTime) {
  if (!audioPlayer.paused) {
    await new Promise((resolve) => {
      fadeOut(audioPlayer, () => {
        audioPlayer.pause();
        resolve();
      });
    });
  }

  audioPlayer.volume = 0;
  audioPlayer.src = url;
  audioPlayer.loop = true;

  audioPlayer.addEventListener("loadedmetadata", () => {
    if (savedTime) {
      audioPlayer.currentTime = parseFloat(savedTime);
    }
    audioPlayer
      .play()
      .then(() => fadeIn(audioPlayer))
      .catch((error) => {
        console.error(`Error playing audio: ${error.message}`);
      });
  });
}
