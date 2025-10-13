import { useEffect, useState } from 'react';

/**
 * Custom hook for syncing state with localStorage
 * @param key - localStorage key
 * @param defaultValue - default value if nothing in localStorage
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Initialize state from localStorage or default value
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  // Save to localStorage whenever value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/**
 * Utility function to clear all app data from localStorage
 */
export function clearAllStorage() {
  try {
    // Remove all LOS calculator related items
    const keys = ['los-points', 'los-fromId', 'los-toId', 'los-selectedLine'];
    keys.forEach(key => window.localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
