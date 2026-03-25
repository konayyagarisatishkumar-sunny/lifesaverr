/**
 * emergencyLoader.js
 * Loads emergency data from local JSON files.
 * Uses fetch API with cache fallback for offline support.
 */

// Map of emergency IDs to their JSON file paths (relative to the app root)
const EMERGENCY_DATA_MAP = {
  burns:       './data/burns.json',
  bleeding:    './data/bleeding.json',
  fractures:   './data/fractures.json',
  choking:     './data/choking.json',
  heartattack: './data/heartattack.json',
  snakebite:   './data/snakebite.json',
  fainting:    './data/fainting.json',
  cpr:         './data/cpr.json',
};

// In-memory cache to avoid redundant fetches during a session
const _cache = {};

/**
 * Loads emergency data for the given emergency ID.
 * Returns cached response if already loaded.
 * @param {string} emergencyId - The emergency category ID
 * @returns {Promise<object>} The parsed emergency data object
 */
export async function loadEmergencyData(emergencyId) {
  if (!emergencyId) throw new Error('Emergency ID is required');

  const id = emergencyId.toLowerCase();
  
  // Return from memory cache if available
  if (_cache[id]) return _cache[id];

  const filePath = EMERGENCY_DATA_MAP[id];
  if (!filePath) {
    throw new Error(`No data file found for emergency: "${id}"`);
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath} (${response.status})`);
    }
    const data = await response.json();
    _cache[id] = data; // Store in memory cache
    return data;
  } catch (err) {
    console.error('[EmergencyLoader] Error loading data:', err);
    throw err;
  }
}

/**
 * Returns the list of all available emergency categories with metadata.
 * @returns {Array<object>} Array of category objects
 */
export function getAllCategories() {
  return [
    { id: 'burns',       title: 'Burns',        icon: '🔥', color: 'from-orange-500 to-red-600',     severity: 'High'     },
    { id: 'bleeding',    title: 'Bleeding',     icon: '🩹', color: 'from-red-500 to-rose-700',       severity: 'High'     },
    { id: 'fractures',   title: 'Fractures',    icon: '🦴', color: 'from-yellow-500 to-amber-600',   severity: 'Medium'   },
    { id: 'choking',     title: 'Choking',      icon: '😮', color: 'from-purple-500 to-violet-700',  severity: 'Critical' },
    { id: 'heartattack', title: 'Heart Attack', icon: '❤️', color: 'from-red-600 to-pink-700',       severity: 'Critical' },
    { id: 'snakebite',   title: 'Snake Bite',   icon: '🐍', color: 'from-green-600 to-emerald-800',  severity: 'High'     },
    { id: 'fainting',    title: 'Fainting',     icon: '😵', color: 'from-blue-500 to-indigo-700',    severity: 'Medium'   },
    { id: 'cpr',         title: 'CPR Guide',    icon: '💓', color: 'from-red-500 to-red-700',        severity: 'Critical' },
  ];
}

/**
 * Preloads all emergency data files into memory cache + service worker cache.
 * Called on app startup to ensure offline availability.
 */
export async function preloadAllData() {
  const ids = Object.keys(EMERGENCY_DATA_MAP);
  const results = await Promise.allSettled(ids.map((id) => loadEmergencyData(id)));
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    console.warn('[EmergencyLoader] Some data files failed to preload:', failed);
  } else {
    console.log('[EmergencyLoader] All emergency data preloaded successfully.');
  }
}
