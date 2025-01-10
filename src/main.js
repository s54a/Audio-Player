import "./style.css";

const urlInput = document.getElementById("urlInput");
const playButton = document.getElementById("playButton");
const audioPlayer = document.getElementById("audioPlayer");
const errorMessage = document.getElementById("errorMessage");
const uploadZone = document.getElementById("upload-zone");
const fileInput = document.getElementById("file-input");
const fileList = document.getElementById("file-list");

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

let db;
let storedFiles = [];
let selectedIndex = -1;

// IndexedDB setup
const request = indexedDB.open("audioLibrary", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains("files")) {
    db.createObjectStore("files", { keyPath: "name" });
  }
};

request.onsuccess = (event) => {
  db = event.target.result;
  loadFilesFromIndexedDB();
};

// File handling
uploadZone.addEventListener("click", () => fileInput.click());
uploadZone.addEventListener("dragover", (e) => e.preventDefault());
uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

function handleFiles(files) {
  const audioFiles = Array.from(files).filter(
    (file) =>
      file.type.includes("audio") || file.name.toLowerCase().endsWith(".mp3")
  );
  saveFilesToIndexedDB(audioFiles);
}

function saveFilesToIndexedDB(files) {
  const transaction = db.transaction("files", "readwrite");
  const store = transaction.objectStore("files");

  files.forEach((file) => {
    const fileData = {
      name: file.name,
      file: file,
      path: file.webkitRelativePath || file.name,
    };
    store.put(fileData);
  });

  transaction.oncomplete = () => {
    loadFilesFromIndexedDB();
  };
}

function loadFilesFromIndexedDB() {
  const transaction = db.transaction("files", "readonly");
  const store = transaction.objectStore("files");
  storedFiles = [];

  store.openCursor().onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      storedFiles.push(cursor.value);
      cursor.continue();
    } else {
      updateFileList();
    }
  };
}

// Search and display functionality
urlInput.addEventListener("input", () => {
  const searchTerm = urlInput.value.toLowerCase();
  updateFileList(searchTerm);
});

function updateFileList(searchTerm = "") {
  fileList.innerHTML = "";
  const filteredFiles = storedFiles.filter((file) =>
    file.path.toLowerCase().includes(searchTerm)
  );

  if (filteredFiles.length > 0) {
    fileList.style.display = "block";
    filteredFiles.forEach((file, index) => {
      const li = document.createElement("li");
      li.textContent = file.path;
      li.onclick = () => selectFile(index, file);
      if (index === selectedIndex) li.classList.add("selected");
      fileList.appendChild(li);
    });
  } else {
    fileList.style.display = "none";
  }
}

function selectFile(index, file) {
  selectedIndex = index;
  urlInput.value = file.path;
  updateFileList();
  const blobURL = URL.createObjectURL(file.file);
  playAudio(blobURL);
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
        errorMessage.style.display = "block";
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

// Keyboard navigation
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && document.activeElement === urlInput) {
    event.preventDefault();
    if (selectedIndex >= 0) {
      const selectedFile = storedFiles[selectedIndex];
      selectFile(selectedIndex, selectedFile);
    } else {
      const audioUrl = urlInput.value.trim();
      if (audioUrl.startsWith("http")) {
        playAudio(audioUrl);
      }
    }
    urlInput.blur();
  } else if (event.key === "ArrowUp" && fileList.style.display === "block") {
    event.preventDefault();
    selectedIndex = Math.max(0, selectedIndex - 1);
    updateFileList(urlInput.value.toLowerCase());
  } else if (event.key === "ArrowDown" && fileList.style.display === "block") {
    event.preventDefault();
    selectedIndex = Math.min(storedFiles.length - 1, selectedIndex + 1);
    updateFileList(urlInput.value.toLowerCase());
  }
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

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.key === "/") {
    event.preventDefault();
    urlInput.focus();
    urlInput.value = "";
  } else if (event.key === "Escape") {
    urlInput.blur();
    urlInput.value = savedUrl;
  } else if (event.code === "Space" && document.activeElement !== urlInput) {
    event.preventDefault();
    if (audioPlayer.paused) {
      audioPlayer.volume = 0;
      audioPlayer.play().then(() => fadeIn());
    } else {
      fadeOut(() => audioPlayer.pause());
    }
  }
});
// document.addEventListener("paste", function (e) {
//   // This will work when user manually pastes
//   const text = e.clipboardData.getData("text");
//   e.preventDefault();
//   urlInput.focus();
//   urlInput.value = "";
//   urlInput.value = text;
//   setTimeout(() => {
//     playButton.click();
//     urlInput.blur();
//   }, 10);
// });

// const container = document.querySelector(".container");
// let isContainerVisible = true;

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    // Volume Up
    audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1);
  } else if (event.key === "ArrowDown") {
    // Volume Down
    audioPlayer.volume = Math.max(audioPlayer.volume - 0.1, 0);
  } else if (event.key === "ArrowRight") {
    // Seek Forward
    audioPlayer.currentTime = Math.min(
      audioPlayer.currentTime + 2.5,
      audioPlayer.duration
    );
  } else if (event.key === "ArrowLeft") {
    // Seek Backward
    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 2.5, 0);
  }
  // else if (event.key === "e") {
  //   // Toggle hide/unhide for the container div
  //   isContainerVisible = !isContainerVisible;
  //   container.style.visibility = isContainerVisible ? "visible" : "hidden";
  // }
});

// Hide file list when clicking outside
document.addEventListener("click", (e) => {
  if (!fileList.contains(e.target) && e.target !== urlInput) {
    fileList.style.display = "none";
  }
});

urlInput.addEventListener("focus", () => {
  if (storedFiles.length > 0) {
    updateFileList(urlInput.value.toLowerCase());
  }
});
