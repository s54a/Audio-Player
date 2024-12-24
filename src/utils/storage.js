// Functions to handle localStorage operations

// Save a value to localStorage
export function saveToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

// Retrieve a value from localStorage
export function getFromLocalStorage(key) {
  return localStorage.getItem(key);
}

// Remove a value from localStorage
export function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}
