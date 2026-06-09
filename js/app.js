/**
 * Main Application Entry Point
 * Initializes all modules and wires up callbacks.
 */

import { loadData } from './data/loader.js';
import { initRegions, renderRegions } from './ui/regions.js';
import { initStations, renderStationsForRegion } from './ui/stations.js';
import { initTabs, switchTab, setRealtimeLoader } from './ui/tabs.js';
import { renderNoiseChart } from './charts/noiseChart.js';
import { renderStationHourly, renderRegionHourly } from './charts/hourlyChart.js';
import { loadAndDisplayRealtimeData } from './charts/realtimeChart.js';

/**
 * Initialize the application
 */
function initApp() {
  // First, set up global functions that data/loader.js expects
  // These must be set BEFORE loadData() is called

  window.renderRegions = renderRegions;
  window.renderStationsForRegion = renderStationsForRegion;
  window.switchTab = switchTab;
  window.renderNoiseChart = renderNoiseChart;
  window.loadAndDisplayRealtimeData = loadAndDisplayRealtimeData;

  // Now initialize modules with proper callbacks

  // Regions callbacks
  initRegions({
    onRegionChange: (region) => {
      // Region changed - will trigger station re-render via callback
    },
    onRenderStations: renderStationsForRegion,
    onSwitchTab: switchTab,
    onRenderChart: renderNoiseChart
  });

  // Stations callbacks
  initStations({
    onStationChange: (stationId) => {
      // Station changed - charts will be updated
    },
    onRenderStationView: renderStationHourly,
    onLoadRealtime: loadAndDisplayRealtimeData
  });

  // Tabs callbacks
  initTabs({
    onTabChange: (tabName) => {
      // Tab changed
    },
    onRenderHourly: (name, isRegion = false) => {
      if (isRegion) {
        renderRegionHourly(name);
      } else {
        renderStationHourly(name);
      }
    }
  });

  // Set the realtime loader for tabs module
  setRealtimeLoader(loadAndDisplayRealtimeData);

  // Load initial data
  loadData();

  console.log('Red Ruido MMA Dashboard initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for potential debugging
export { initApp };