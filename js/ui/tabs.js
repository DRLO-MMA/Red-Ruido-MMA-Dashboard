/**
 * Tabs UI Module
 * Handles tab switching for: Nivel de Ruido, Perfil Horario, Tiempo Real
 */

import { CSS_CLASSES } from '../config.js';
import { state } from '../state.js';
import { updateTabButtons, switchTabContent } from '../utils/dom.js';

let onTabChangeCallback = null;
let onRenderHourlyCallback = null;

/**
 * Initialize tabs with callbacks
 *
 * @param {Object} callbacks - Callback functions
 * @param {Function} callbacks.onTabChange - Called when tab changes
 * @param {Function} callbacks.onRenderHourly - Called to render hourly chart
 */
export function initTabs(callbacks) {
  onTabChangeCallback = callbacks.onTabChange;
  onRenderHourlyCallback = callbacks.onRenderHourly;
  window.switchTab = switchTab;
  setupTabListeners();

  // Initially hide Tiempo Real tab (no station selected yet)
  setTiempoRealTabVisibility(false);
}

/**
 * Set up click listeners for tab buttons
 */
function setupTabListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
}

/**
 * Switch to a specific tab
 *
 * @param {string} tabName - Tab name: 'ruido', 'horario', 'tiempo-real'
 */
export function switchTab(tabName) {
  // Update button states
  updateTabButtons(tabName);

  // Update content visibility
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('hidden', !c.id.endsWith(tabName));
    c.classList.toggle('block', c.id.endsWith(tabName));
  });

  // Handle tab-specific logic
  if (onTabChangeCallback) {
    onTabChangeCallback(tabName);
  }

  if (tabName === 'horario') {
    handleHorarioTab();
  } else if (tabName === 'tiempo-real') {
    handleTiempoRealTab();
  }
}

/**
 * Handle Horario tab activation
 */
function handleHorarioTab() {
  if (state.activeStation && onRenderHourlyCallback) {
    onRenderHourlyCallback(state.activeStation);
  } else if (state.activeRegion && onRenderHourlyCallback) {
    onRenderHourlyCallback(state.activeRegion, true); // true = isRegion
  } else {
    showPlaceholderHorario();
  }
}

/**
 * Handle Tiempo Real tab activation
 */
function handleTiempoRealTab() {
  // This will be handled by the realtime chart module via callback
  // Just need to ensure the container is ready
  if (window.loadAndDisplayRealtimeData) {
    loadAndDisplayRealtimeData(state.activeStation);
  }
}

/**
 * Show placeholder in horario tab
 */
function showPlaceholderHorario() {
  const container = document.getElementById('tab-horario');
  if (container) {
    container.innerHTML = `
      <div class="flex items-center justify-center h-[200px] text-sm text-gray-400">
        Perfil Horario - selecciona una estación o región
      </div>`;
  }
}

/**
 * Show/hide the Tiempo Real tab button
 * @param {boolean} show - true to show, false to hide
 */
export function setTiempoRealTabVisibility(show) {
  const btn = document.querySelector('.tab-btn[data-tab="tiempo-real"]');
  if (btn) {
    btn.style.display = show ? 'inline-block' : 'none';

    // If hiding and currently on tiempo-real tab, switch to ruido
    if (!show && btn.classList.contains('text-white')) {
      switchTab('ruido');
    }
  }
}

/**
 * Load and display realtime data (called from realtime chart module)
 * Exposed globally for tabs.js to call
 */
window.loadAndDisplayRealtimeData = async function(stationName) {
  // This will be overridden by the realtime chart module
};

/**
 * Set the realtime data loader function
 * Called from app.js after all modules are loaded
 */
export function setRealtimeLoader(loaderFn) {
  window.loadAndDisplayRealtimeData = loaderFn;
}