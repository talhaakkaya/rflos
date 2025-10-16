import type { Point } from '../types';

interface AppState {
  points: Point[];
  losFromId: string;
  losToId: string;
  selectedLine: { fromId: string; toId: string } | null;
  hideLines?: boolean;
  isPanelVisible?: boolean;
  isLOSPanelOpen?: boolean;
}

/**
 * Encode app state to URL parameters
 */
export function encodeStateToURL(state: AppState): string {
  const params = new URLSearchParams();

  // Encode points as base64 JSON
  params.set('p', btoa(JSON.stringify(state.points)));

  // Encode IDs
  params.set('from', state.losFromId);
  params.set('to', state.losToId);

  // Encode selected line if present
  if (state.selectedLine) {
    params.set('sel', `${state.selectedLine.fromId},${state.selectedLine.toId}`);
  }

  // Encode hideLines if not default (false)
  if (state.hideLines !== undefined && state.hideLines !== false) {
    params.set('hl', state.hideLines ? '1' : '0');
  }

  // Encode isPanelVisible if not default (true)
  if (state.isPanelVisible !== undefined && state.isPanelVisible !== true) {
    params.set('pv', state.isPanelVisible ? '1' : '0');
  }

  // Encode isLOSPanelOpen if not default (true)
  if (state.isLOSPanelOpen !== undefined && state.isLOSPanelOpen !== true) {
    params.set('los', state.isLOSPanelOpen ? '1' : '0');
  }

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

/**
 * Decode app state from URL parameters
 */
export function decodeStateFromURL(): Partial<AppState> | null {
  const params = new URLSearchParams(window.location.search);
  console.log('Decoding URL, search params:', window.location.search);

  if (!params.has('p')) {
    console.log('No p parameter found in URL');
    return null; // No state in URL
  }

  try {
    const state: Partial<AppState> = {};

    // Decode points
    if (params.has('p')) {
      const base64Points = params.get('p')!;
      console.log('Base64 points from URL:', base64Points);
      const decodedJSON = atob(base64Points);
      console.log('Decoded JSON:', decodedJSON);
      state.points = JSON.parse(decodedJSON);
      console.log('Parsed points:', state.points);
    }

    // Decode IDs
    if (params.has('from')) {
      state.losFromId = params.get('from')!;
    }

    if (params.has('to')) {
      state.losToId = params.get('to')!;
    }

    // Decode selected line
    if (params.has('sel')) {
      const [fromId, toId] = params.get('sel')!.split(',');
      state.selectedLine = { fromId, toId };
    }

    // Decode hideLines
    if (params.has('hl')) {
      state.hideLines = params.get('hl') === '1';
    }

    // Decode isPanelVisible
    if (params.has('pv')) {
      state.isPanelVisible = params.get('pv') === '1';
    }

    // Decode isLOSPanelOpen
    if (params.has('los')) {
      state.isLOSPanelOpen = params.get('los') === '1';
    }

    console.log('Successfully decoded state from URL:', state);
    return state;
  } catch (error) {
    console.error('Failed to decode state from URL:', error);
    return null;
  }
}

/**
 * Update URL with current state without page reload
 */
export function updateURL(state: AppState) {
  try {
    const params = new URLSearchParams();

    // Encode points as base64 JSON
    const pointsJSON = JSON.stringify(state.points);
    console.log('Points JSON:', pointsJSON);
    const pointsBase64 = btoa(pointsJSON);
    console.log('Points Base64:', pointsBase64);
    params.set('p', pointsBase64);

    // Encode IDs
    params.set('from', state.losFromId);
    params.set('to', state.losToId);

    // Encode selected line if present
    if (state.selectedLine) {
      params.set('sel', `${state.selectedLine.fromId},${state.selectedLine.toId}`);
    }

    // Encode hideLines if not default (false)
    if (state.hideLines !== undefined && state.hideLines !== false) {
      params.set('hl', state.hideLines ? '1' : '0');
    }

    // Encode isPanelVisible if not default (true)
    if (state.isPanelVisible !== undefined && state.isPanelVisible !== true) {
      params.set('pv', state.isPanelVisible ? '1' : '0');
    }

    // Encode isLOSPanelOpen if not default (true)
    if (state.isLOSPanelOpen !== undefined && state.isLOSPanelOpen !== true) {
      params.set('los', state.isLOSPanelOpen ? '1' : '0');
    }

    const queryString = params.toString();
    console.log('Query string:', queryString);
    const newURL = `${window.location.pathname}?${queryString}`;
    console.log('New URL:', newURL);
    window.history.replaceState({}, '', newURL);
    console.log('Current browser URL:', window.location.href);
  } catch (error) {
    console.error('Error updating URL:', error);
  }
}

/**
 * Copy URL to clipboard
 */
export async function copyURLToClipboard(state: AppState): Promise<boolean> {
  try {
    const url = encodeStateToURL(state);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
}
