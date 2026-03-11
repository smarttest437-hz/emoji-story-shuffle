import { useState } from 'react';

/**
 * Custom hook for managing localStorage with React state
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter that persists to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error saving localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Simple seeded random number generator (mulberry32)
 * Returns a function that generates deterministic random numbers from 0 to 1
 */
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Parse seed from URL or generate new one
 */
export function getSeedFromURL(): number {
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get('seed');
  return seedParam ? parseInt(seedParam, 10) : Date.now();
}

/**
 * Get random emojis from the seed list
 * @param emojis - Full emoji array
 * @param count - Number of emojis to return
 * @param lockedIndices - Indices to keep unchanged
 * @param seed - Optional seed for deterministic randomness
 * @returns Array of selected emojis
 */
export function getRandomEmojis(
  emojis: string[],
  count: number,
  lockedIndices: Set<number> = new Set(),
  seed?: number
): string[] {
  const random = seed !== undefined ? seededRandom(seed) : Math.random;
  const result: string[] = new Array(count);
  const available = [...emojis];

  // Fill in locked positions first (if we're reusing previous selection)
  // For now, we'll just generate fresh emojis for unlocked positions

  for (let i = 0; i < count; i++) {
    if (!lockedIndices.has(i)) {
      // Pick random emoji
      const randomIndex = Math.floor(random() * available.length);
      result[i] = available[randomIndex];
    }
    // If locked, result[i] will remain undefined here;
    // caller should preserve the existing emoji
  }

  return result;
}

/**
 * Count words in a text string
 * Words are separated by whitespace
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Format time in mm:ss format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Download text as a file
 */
export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
