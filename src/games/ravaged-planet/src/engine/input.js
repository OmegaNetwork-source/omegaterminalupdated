import {DEFAULT_KEYPRESS_DELAY} from './constants.js';

const input = {};
let lastKeypressTime = 0;

// Normalize key names for consistency
function normalizeKey(key) {
  // Handle Space key
  if (key === ' ' || key === 'Space') return ' ';
  // Handle special keys
  const keyMap = {
    'ArrowLeft': 'ArrowLeft',
    'ArrowRight': 'ArrowRight',
    'ArrowUp': 'ArrowUp',
    'ArrowDown': 'ArrowDown',
    'Tab': 'Tab',
    'Enter': 'Enter',
    'Escape': 'Escape',
    'Shift': 'Shift',
    'Alt': 'Alt',
    'Control': 'Control',
    'Meta': 'Meta',
  };
  return keyMap[key] || key;
}

document.addEventListener('keydown', (e) => {
  const normalizedKey = normalizeKey(e.key);
  input[normalizedKey] = true;
  input[e.code] = true; // Also store by code for arrow keys
  input[e.key.toLowerCase()] = true; // Also store lowercase for 'a', 'd', etc.
  input[e.key.toUpperCase()] = true; // Also store uppercase
  
  // Only prevent default for game control keys, not all keys
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', ' ', 'Space'].includes(normalizedKey)) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  const normalizedKey = normalizeKey(e.key);
  input[normalizedKey] = false;
  input[e.code] = false;
  input[e.key.toLowerCase()] = false;
  input[e.key.toUpperCase()] = false;
  
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', ' ', 'Space'].includes(normalizedKey)) {
    e.preventDefault();
  }
});

export function key(keyName) {
  // Check multiple possible key representations
  return input[keyName] || 
         input[keyName.toLowerCase()] || 
         input[keyName.toUpperCase()] ||
         input[normalizeKey(keyName)] ||
         false;
}

// Export input object for character movement
export function getInput() {
  return input;
}

export function afterKeyDelay(amount=DEFAULT_KEYPRESS_DELAY) {
  const now = Date.now();
  if (now - lastKeypressTime >= amount) {
    lastKeypressTime = now;
    return true;
  }
  return false;
}
