/**
 * Region Buttons UI Module
 * Handles rendering and interaction for region selection buttons.
 */

import { CSS_CLASSES } from '../config.js';
import { state } from '../state.js';
import { createButton, clearContainer } from '../utils/dom.js';
import { setTiempoRealTabVisibility } from './tabs.js';

let onRegionChangeCallback = null;

/**
 * Initialize region UI with callbacks
 *
 * @param {Object} callbacks - Callback functions
 * @param {Function} callbacks.onRegionChange - Called when region changes
 * @param {Function} callbacks.onRenderStations - Called to render stations for region
 * @param {Function} callbacks.onSwitchTab - Called to switch tab
 * @param {Function} callbacks.onRenderChart - Called to re-render noise chart
 */
export function initRegions(callbacks) {
  onRegionChangeCallback = callbacks.onRegionChange;
  window.renderRegions = renderRegions;
  window.renderStationsForRegion = callbacks.onRenderStations;
  window.switchTab = callbacks.onSwitchTab;
  window.renderNoiseChart = callbacks.onRenderChart;
}

/**
 * Render region buttons based on current state
 */
export function renderRegions() {
  const container = document.getElementById('regions');
  if (!container) return;

  clearContainer(container);

  const regions = state.regions;

  if (!regions.length) {
    container.innerHTML = `<div class="${CSS_CLASSES.errorMsg}">Error, prueba en otro momento (NOREG)</div>`;
    return;
  }

  const activeRegion = state.activeRegion;

  regions.forEach(region => {
    const isActive = region === activeRegion;
    const className = `${CSS_CLASSES.regionBtnBase} ${isActive ? CSS_CLASSES.regionBtnActive : CSS_CLASSES.regionBtnInactive}`;

    const btn = createButton(className, region, { r: region }, () => handleRegionClick(region, btn));
    container.appendChild(btn);
  });
}

/**
 * Handle region button click
 *
 * @param {string} region - Region name
 * @param {HTMLButtonElement} btn - Clicked button element
 */
function handleRegionClick(region, btn) {
  // Update visual state
  document.querySelectorAll('.region-btn').forEach(x => {
    x.className = `${CSS_CLASSES.regionBtnBase} ${CSS_CLASSES.regionBtnInactive}`;
  });
  btn.className = `${CSS_CLASSES.regionBtnBase} ${CSS_CLASSES.regionBtnActive}`;

  // Update state
  state.setActiveRegion(region);
  state.setActiveStation(null);

  // Hide Tiempo Real tab when region is selected (no station)
  setTiempoRealTabVisibility(false);

  // Notify callbacks
  if (onRegionChangeCallback) {
    onRegionChangeCallback(region);
  }

  // Trigger dependent updates
  if (window.renderStationsForRegion) window.renderStationsForRegion(region);
  if (window.switchTab) window.switchTab('ruido');
  if (window.renderNoiseChart) window.renderNoiseChart();
}

/**
 * Set active region programmatically (e.g., from URL hash or restore)
 *
 * @param {string} region - Region name
 */
export function setActiveRegion(region) {
  state.setActiveRegion(region);
  renderRegions();
}