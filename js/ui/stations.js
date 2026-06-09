/**
 * Station Buttons UI Module
 * Handles rendering and interaction for station selection buttons.
 */

import { CSS_CLASSES, COLORS } from '../config.js';
import { state } from '../state.js';
import { createButton, clearContainer, setActiveButton } from '../utils/dom.js';
import { setTiempoRealTabVisibility } from './tabs.js';

let onStationChangeCallback = null;
let onRenderStationViewCallback = null;
let onLoadRealtimeCallback = null;

/**
 * Initialize station UI with callbacks
 *
 * @param {Object} callbacks - Callback functions
 * @param {Function} callbacks.onStationChange - Called when station changes
 * @param {Function} callbacks.onRenderStationView - Called to render hourly view for station
 * @param {Function} callbacks.onLoadRealtime - Called to load realtime data
 */
export function initStations(callbacks) {
  onStationChangeCallback = callbacks.onStationChange;
  onRenderStationViewCallback = callbacks.onRenderStationView;
  onLoadRealtimeCallback = callbacks.onLoadRealtime;
  window.renderStationsForRegion = renderStationsForRegion;
}

/**
 * Render station buttons for a specific region
 *
 * @param {string} region - Region name
 */
export function renderStationsForRegion(region) {
  const container = document.getElementById('stations');
  if (!container) return;

  clearContainer(container);

  const filtered = region ? state.annualData.filter(d => d.Region === region) : state.annualData;
  const uniq = [...new Set(filtered.map(d => d.Estacion))].sort();

  // Build station metadata with latest noise value and color
  const stationMeta = uniq.map((id, i) => {
    const rows = filtered.filter(r => r.Estacion === id);
    const years = rows.map(r => Number(r.Anio || 0)).filter(Boolean);
    let val = null;

    if (years.length) {
      const maxY = Math.max(...years);
      const found = rows.find(r => Number(r.Anio) === maxY);
      val = found ? parseFloat((found.Ruido_dB || '0').toString().replace(',', '.')) : null;
    }

    return {
      id,
      val: val === null ? 50 : Math.round(val || 50),
      color: COLORS[i % COLORS.length]
    };
  });

  state.setStationMeta(stationMeta);
  state.setActiveStations(new Set(stationMeta.map(s => s.id)));

  stationMeta.forEach(s => {
    const className = CSS_CLASSES.stationBtnBase;
    const btn = createButton(className, s.id, { sid: s.id }, () => handleStationClick(s.id, btn));
    container.appendChild(btn);
  });
}

/**
 * Handle station button click
 *
 * @param {string} stationId - Station ID
 * @param {HTMLButtonElement} btn - Clicked button element
 */
function handleStationClick(stationId, btn) {
  // Update visual state
  setActiveButton('.station-btn', CSS_CLASSES.stationBtnActive, CSS_CLASSES.stationBtnInactive, stationId, 'sid');

  // Update state
  state.setActiveStation(stationId);
  state.setActiveStations(new Set([stationId]));

  // Show Tiempo Real tab when station is selected
  setTiempoRealTabVisibility(true);

  // Switch to "Nivel de Ruido" tab
  switchTab('ruido');

  // Notify callbacks
  if (onStationChangeCallback) {
    onStationChangeCallback(stationId);
  }

  // Render charts
  if (window.renderNoiseChart) window.renderNoiseChart();
  if (onRenderStationViewCallback) onRenderStationViewCallback(stationId);
}

/**
 * Set active station programmatically
 *
 * @param {string} stationId - Station ID
 */
export function setActiveStation(stationId) {
  state.setActiveStation(stationId);
  state.setActiveStations(new Set([stationId]));
  setActiveButton('.station-btn', CSS_CLASSES.stationBtnActive, CSS_CLASSES.stationBtnInactive, stationId, 'sid');
  setTiempoRealTabVisibility(true);
}