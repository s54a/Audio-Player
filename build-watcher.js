// // build-watcher.js
// import { exec } from "child_process";
// import chokidar from "chokidar";
// import fs from "fs";
// import path from "path";

// // Configuration
// const CONFIG = {
//   // watchPaths: ["src/**/*.(js|html|css)"], // Changed to watch src folder only
//   ignorePaths: ["node_modules/**", "dist/**"],
//   buildCommand: "pnpm build",
//   debounceTime: 1000, // Time in ms to wait before triggering another build
// };

// let buildInProgress = false;
// let pendingBuild = false;

// const runBuild = async () => {
//   if (buildInProgress) {
//     pendingBuild = true;
//     return;
//   }

//   buildInProgress = true;
//   console.log("\n🔨 Starting build...");

//   exec(CONFIG.buildCommand, (error, stdout, stderr) => {
//     buildInProgress = false;

//     if (error) {
//       console.error("❌ Build failed:", error);
//       console.error(stderr);
//     } else {
//       console.log("✅ Build completed successfully");
//       console.log(stdout);
//     }

//     if (pendingBuild) {
//       pendingBuild = false;
//       runBuild();
//     }
//   });
// };

// // Initialize watcher
// const watcher = chokidar.watch(CONFIG.watchPaths, {
//   ignored: CONFIG.ignorePaths,
//   persistent: true,
//   ignoreInitial: true,
// });

// // Debounce function
// let timeoutId = null;
// const debouncedBuild = () => {
//   if (timeoutId) clearTimeout(timeoutId);
//   timeoutId = setTimeout(runBuild, CONFIG.debounceTime);
// };

// // Watch events
// watcher
//   .on("add", (path) => {
//     console.log(`📁 File ${path} has been added`);
//     debouncedBuild();
//   })
//   .on("change", (path) => {
//     console.log(`📝 File ${path} has been changed`);
//     debouncedBuild();
//   })
//   .on("unlink", (path) => {
//     console.log(`🗑️  File ${path} has been removed`);
//     debouncedBuild();
//   });

// console.log("👀 Watching for files in src folder...");

// import chokidar from "chokidar";
// import { exec } from "child_process";

// // Watch current directory, ignoring node_modules and .git
// const watcher = chokidar.watch(".", {
//   // ignored: /node_modules|\.git/, // Ignore node_modules and .git directories
//   ignored: [
//     "node_modules/**",
//     ".git/**",
//     "dist/**",
//     "assets/**",
//     ".vscode/**",
//     "package-lock.json",
//     "temp/**",
//   ],
//   // persistent: true,
// });

// // Event listener for file changes
// watcher.on("change", (event, path) => {
//   console.log(`${event} detected on: ${path}`);

//   // Run pnpm build command
//   exec("pnpm build", (err, stdout, stderr) => {
//     if (err) {
//       console.error(`Error: ${err.message}`);
//       return;
//     }
//     if (stderr) {
//       console.error(`Stderr: ${stderr}`);
//       return;
//     }
//     console.log(`Output: ${stdout}`);
//   });
// });

// import chokidar from "chokidar";
// import { exec } from "child_process";

// // Store timers for debouncing
// const debounceTimers = new Map();

// const watcher = chokidar.watch(".", {
//   ignored: [
//     "**/node_modules/**",
//     "**/.git/**",
//     "**/dist/**", // Ensure dist is ignored
//     "**/assets/**",
//     "**/.vscode/**",
//     "**/package-lock.json",
//     "**/temp/**",
//   ],
//   persistent: true, // Keeps the watcher running
// });

// // Event listener for file changes
// watcher.on("change", (path) => {
//   console.log(`Change detected on: ${path}`);

//   // Clear any existing debounce timer for this file
//   if (debounceTimers.has(path)) {
//     clearTimeout(debounceTimers.get(path));
//   }

//   // Set a new debounce timer for the file
//   const timer = setTimeout(() => {
//     console.log(`File saved: ${path}. Running build...`);

//     // Run pnpm build command
//     exec("pnpm build", (err, stdout, stderr) => {
//       if (err) {
//         console.error(`Error: ${err.message}`);
//         return;
//       }
//       if (stderr) {
//         console.error(`Stderr: ${stderr}`);
//         return;
//       }
//       console.log(`Output: ${stdout}`);
//     });

//     // Remove the timer after execution
//     debounceTimers.delete(path);
//   }, 500); // 500ms debounce delay (adjustable)

//   debounceTimers.set(path, timer);
// });

import chokidar from "chokidar";
import { exec } from "child_process";

// Store timers for debouncing
const debounceTimers = new Map();

// Watch current directory, ignoring specified directories and files
const watcher = chokidar.watch(".", {
  ignored: (path) => {
    const ignoredPaths = [
      "node_modules",
      ".git",
      "dist",
      "assets",
      ".vscode",
      "package-lock.json",
      "temp",
    ];
    return ignoredPaths.some((ignore) => path.includes(ignore));
  },
  persistent: true, // Keeps the watcher running
  ignoreInitial: true, // Ignore changes to files at startup
});

// Event listener for file changes
watcher.on("change", (path) => {
  console.log(`Change detected on: ${path}`);

  // Clear any existing debounce timer for this file
  if (debounceTimers.has(path)) {
    clearTimeout(debounceTimers.get(path));
  }

  // Set a new debounce timer for the file
  const timer = setTimeout(() => {
    console.log(`File saved: ${path}. Running build...`);

    // Run pnpm build command
    exec("pnpm build", (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${err.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Output: ${stdout}`);
    });

    // Remove the timer after execution
    debounceTimers.delete(path);
  }, 500); // 500ms debounce delay (adjustable)

  debounceTimers.set(path, timer);
});

// Debugging Ignored Paths
watcher.on("ready", () => {
  console.log("Watcher is ready and actively monitoring files.");
});
