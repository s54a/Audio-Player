// build-watcher.js
import { exec } from "child_process";
import chokidar from "chokidar";
import fs from "fs";
import path from "path";

// Configuration
const CONFIG = {
  watchPaths: ["./**/*.(js|html|css)"], // Add more extensions if needed
  ignorePaths: ["node_modules/**", "dist/**"],
  buildCommand: "npm run build", // Or 'yarn build' depending on your setup
  debounceTime: 1000, // Time in ms to wait before triggering another build
};

let buildInProgress = false;
let pendingBuild = false;

const runBuild = async () => {
  if (buildInProgress) {
    pendingBuild = true;
    return;
  }

  buildInProgress = true;
  console.log("\n🔨 Starting build...");

  exec(CONFIG.buildCommand, (error, stdout, stderr) => {
    buildInProgress = false;

    if (error) {
      console.error("❌ Build failed:", error);
      console.error(stderr);
    } else {
      console.log("✅ Build completed successfully");
      console.log(stdout);
    }

    if (pendingBuild) {
      pendingBuild = false;
      runBuild();
    }
  });
};

// Initialize watcher
const watcher = chokidar.watch(CONFIG.watchPaths, {
  ignored: CONFIG.ignorePaths,
  persistent: true,
  ignoreInitial: true,
});

// Debounce function
let timeoutId = null;
const debouncedBuild = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(runBuild, CONFIG.debounceTime);
};

// Watch events
watcher
  .on("add", (path) => {
    console.log(`📁 File ${path} has been added`);
    debouncedBuild();
  })
  .on("change", (path) => {
    console.log(`📝 File ${path} has been changed`);
    debouncedBuild();
  })
  .on("unlink", (path) => {
    console.log(`🗑️  File ${path} has been removed`);
    debouncedBuild();
  });

console.log("👀 Watching for file changes...");
