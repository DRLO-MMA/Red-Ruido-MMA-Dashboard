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
  console.log('[TABS] switchTab called:', tabName);

  // Update button states
  updateTabButtons(tabName);

  // Update content visibility
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('hidden', !c.id.endsWith(tabName));
    c.classList.toggle('block', c.id.endsWith(tabName));
  });

  // Verify tab visibility
  const activeTab = document.getElementById(`tab-${tabName}`);
  console.log('[TABS] Active tab element:', activeTab);
  console.log('[TABS] Active tab classes:', activeTab?.classList.toString());

  // Handle tab-specific logic
  if (onTabChangeCallback) {
    onTabChangeCallback(tabName);
  }

  // Defer tab-specific handlers to next frame to ensure container is visible
  // This fixes Plotly rendering issues when tab was previously hidden
  requestAnimationFrame(() => {
    console.log('[TABS] requestAnimationFrame fired for:', tabName);
    if (tabName === 'horario') {
      console.log('[TABS] Calling handleHorarioTab');
      handleHorarioTab();
    } else if (tabName === 'tiempo-real') {
      console.log('[TABS] Calling handleTiempoRealTab');
      handleTiempoRealTab();
    }
  });
}

/**
 * Handle Horario tab activation
 */
function handleHorarioTab() {
  console.log('[TABS] handleHorarioTab called');
  console.log('[TABS] state.activeStation:', state.activeStation);
  console.log('[TABS] state.activeRegion:', state.activeRegion);
  console.log('[TABS] onRenderHourlyCallback exists:', !!onRenderHourlyCallback);

  if (state.activeStation && onRenderHourlyCallback) {
    console.log('[TABS] Rendering hourly for STATION:', state.activeStation);
    onRenderHourlyCallback(state.activeStation);
  } else if (state.activeRegion && onRenderHourlyCallback) {
    console.log('[TABS] Rendering hourly for REGION:', state.activeRegion);
    onRenderHourlyCallback(state.activeRegion, true); // true = isRegion
  } else {
    console.log('[TABS] No station/region selected, showing placeholder');
    showPlaceholderHorario();
  }
}

/**
 * Handle Tiempo Real tab activation
 */
function handleTiempoRealTab() {
  // Show loading message immediately when tab is clicked
  showRealtimeLoadingPlaceholder('Cargando ...');

  // This will be handled by the realtime chart module via callback
  // Just need to ensure the container is ready
  if (window.loadAndDisplayRealtimeData) {
    loadAndDisplayRealtimeData(state.activeStation);
  }
}

/**
 * Show loading placeholder in realtime tab
 *
 * @param {string} message - Message to display
 */
function showRealtimeLoadingPlaceholder(message) {
  const container = document.getElementById('tab-tiempo-real');
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-[200px] text-sm text-gray-400 gap-2">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-[#2c2c2a] border-t-transparent"></div>
        <span>${message}</span>
      </div>`;
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