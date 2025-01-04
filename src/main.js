import "./style.css";

const urlInput = document.getElementById("urlInput");
const audioPlayer = document.getElementById("audioPlayer");
const errorMessage = document.getElementById("errorMessage");
const folderInput = document.getElementById("folder-input");
const songList = document.getElementById("songList");

let songs = [];

const FADE_DURATION = 1000;
const FADE_INTERVAL = 50;
let fadeTimeout = null;

// Load saved songs from localStorage
const savedSongs = localStorage.getItem("songs");
if (savedSongs) {
  songs = JSON.parse(savedSongs);
  renderSongList(songs);
}

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
  if (fadeTimeout) {
    clearTimeout(fadeTimeout);
  }

  if (!audioPlayer.paused) {
    await new Promise((resolve) => {
      fadeOut(() => {
        audioPlayer.pause();
        resolve();
      });
    });
  }

  audioPlayer.volume = 0;
  audioPlayer.src = url;
  audioPlayer.loop = true;

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

function handleFiles(event) {
  const files = Array.from(event.target.files).filter((file) =>
    file.type.includes("audio")
  );

  songs = files.map((file) => ({
    name: file.name,
    path: URL.createObjectURL(file),
    fullPath: file.webkitRelativePath,
  }));

  localStorage.setItem("songs", JSON.stringify(songs));
  renderSongList(songs);
}

function renderSongList(songArray) {
  songList.innerHTML = "";
  songArray.forEach((song) => {
    const div = document.createElement("div");
    div.className = "song-item";
    div.textContent = song.name;
    div.addEventListener("click", () => playAudio(song.path));
    songList.appendChild(div);
  });
}

urlInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredSongs = songs.filter((song) =>
    song.name.toLowerCase().includes(searchTerm)
  );
  renderSongList(filteredSongs);
});

folderInput.addEventListener("change", handleFiles);

document.addEventListener("keydown", (event) => {
  if (event.key === "/") {
    event.preventDefault();
    urlInput.focus();
  } else if (event.key === "Escape") {
    urlInput.blur();
  } else if (event.code === "Space") {
    event.preventDefault();
    if (audioPlayer.paused) {
      audioPlayer.volume = 0;
      audioPlayer.play().then(() => fadeIn());
    } else {
      fadeOut(() => audioPlayer.pause());
    }
  } else if (event.key === "ArrowUp") {
    audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1);
  } else if (event.key === "ArrowDown") {
    audioPlayer.volume = Math.max(audioPlayer.volume - 0.1, 0);
  } else if (event.key === "ArrowRight") {
    audioPlayer.currentTime = Math.min(
      audioPlayer.currentTime + 2.5,
      audioPlayer.duration
    );
  } else if (event.key === "ArrowLeft") {
    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 2.5, 0);
  }
});

// Update the handleFiles function and add necessary data structures
// const urlInput = document.getElementById("urlInput");
// const audioPlayer = document.getElementById("audioPlayer");
// const errorMessage = document.getElementById("errorMessage");
// const folderInput = document.getElementById("folder-input");
// const songList = document.getElementById("songList");

// let songs = [];
// let songPaths = new Map(); // To store file paths

// // Load saved paths from localStorage
// const savedPaths = localStorage.getItem("songPaths");
// if (savedPaths) {
//   const pathsArray = JSON.parse(savedPaths);
//   songPaths = new Map(pathsArray);
//   renderSongList(Array.from(songPaths.keys()));
// }

// function handleFiles(event) {
//   const files = Array.from(event.target.files).filter((file) =>
//     file.type.includes("audio")
//   );

//   // Clear existing paths if needed
//   songPaths.clear();

//   // Store paths and create object URLs
//   files.forEach((file) => {
//     const objectUrl = URL.createObjectURL(file);
//     songPaths.set(file.webkitRelativePath, objectUrl);
//   });

//   // Save paths to localStorage
//   localStorage.setItem(
//     "songPaths",
//     JSON.stringify(Array.from(songPaths.entries()))
//   );

//   // Update song list display
//   renderSongList(Array.from(songPaths.keys()));
// }

// function renderSongList(paths) {
//   songList.innerHTML = "";
//   paths.forEach((path) => {
//     const div = document.createElement("div");
//     div.className = "song-item";
//     // Extract filename from path
//     const fileName = path.split("/").pop();
//     div.textContent = fileName;
//     div.addEventListener("click", () => {
//       const objectUrl = songPaths.get(path);
//       if (objectUrl) {
//         playAudio(objectUrl);
//       }
//     });
//     songList.appendChild(div);
//   });
// }

// urlInput.addEventListener("input", (e) => {
//   const searchTerm = e.target.value.toLowerCase();
//   const filteredPaths = Array.from(songPaths.keys()).filter((path) =>
//     path.toLowerCase().includes(searchTerm)
//   );
//   renderSongList(filteredPaths);
// });

// // Clean up object URLs when window unloads
// window.addEventListener("unload", () => {
//   songPaths.forEach((objectUrl) => {
//     URL.revokeObjectURL(objectUrl);
//   });

// });
