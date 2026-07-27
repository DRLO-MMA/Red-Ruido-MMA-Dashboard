/**
 * Station Info Module
 * Loads station descriptions and images on demand.
 */

import { parseCSV } from '../utils/csv.js';

const INFO_URL = 'DATA/info_estaciones.csv';
let _infoMap = null;
let _loading = false;

/**
 * Get info for a specific station
 * Lazily loads the CSV on first call, caches the result.
 *
 * @param {string} stationName - Station name
 * @returns {Promise<Object|null>} { Descripcion, Imagen } or null
 */
export async function getStationInfo(stationName) {
  if (!_infoMap) {
    if (_loading) {
      // Wait for in-flight request
      await new Promise(resolve => {
        const check = () => {
          if (!_loading) resolve();
          else setTimeout(check, 50);
        };
        check();
      });
      return _infoMap?.get(stationName) || null;
    }

    _loading = true;
    try {
      const res = await fetch(INFO_URL);
      if (!res.ok) throw new Error('Estaciones info no encontrado');
      const text = await res.text();
      const rows = parseCSV(text);
      _infoMap = new Map(rows.map(r => [r.Estacion, r]));
    } catch {
      // Silently fail — station info is non-critical
      _infoMap = new Map();
    }
    _loading = false;
  }

  return _infoMap.get(stationName) || null;
}

/**
 * Reset cached info (useful for testing or data refresh)
 */
export function resetStationInfo() {
  _infoMap = null;
}
