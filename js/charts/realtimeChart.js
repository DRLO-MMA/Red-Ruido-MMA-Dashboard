/**
 * Real-time Chart Module
 * Loads and displays real-time noise data for a station.
 */

import { REALTIME_URL_PREFIX, REALTIME_URL_SUFFIX } from '../config.js';
import { state } from '../state.js';
import { parseCSV } from '../utils/csv.js';
import { buildRealtimeChartLayout, createScatterTrace } from './layouts.js';
import { showPlaceholder, createChartContainer } from '../utils/dom.js';

const REALTIME_CONTAINER = 'realtime-chart';
const TAB_CONTAINER = 'tab-tiempo-real';

/**
 * Load and display real-time data for a station
 *
 * @param {string} stationName - Station name
 */
export async function loadAndDisplayRealtimeData(stationName) {
  if (!stationName) {
    showTabPlaceholder('Seleccione una estación');
    return;
  }

  showTabPlaceholder('Cargando datos en tiempo real...');

  try {
    // Find n_serie for the station from annual data (most recent year)
    const nSerie = state.getStationSerie(stationName);

    if (!nSerie) {
      showTabPlaceholder('No se encontró n_serie para la estación');
      return;
    }

    const url = `${REALTIME_URL_PREFIX}${nSerie}${REALTIME_URL_SUFFIX}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`No se pudieron cargar los datos en tiempo real para n_serie ${nSerie}`);
    }

    const csvText = await response.text();
    const data = parseCSV(csvText);

    if (!data.length) {
      showTabPlaceholder('No hay datos disponibles en tiempo real');
      return;
    }

    // Parse data
    const timestamps = data.map(row => new Date(row.Datetime));
    const noiseLevels = data.map(row => parseFloat(row.Laeq));

    // Create chart container
    const tabContainer = document.getElementById(TAB_CONTAINER);
    if (tabContainer) {
      tabContainer.innerHTML = `<div id="${REALTIME_CONTAINER}" style="width:100%; height:350px;"></div>`;
    }

    // Create trace
    const trace = createScatterTrace(
      timestamps,
      noiseLevels,
      'Tiempo Real',
      '#e84080',
      {
        mode: 'lines',
        hovertemplate: '<b>%{x}</b><br>Ruido: %{y:.2f} dBA<extra></extra>'
      }
    );

    // Create layout
    const layout = buildRealtimeChartLayout(
      `Datos en Tiempo Real - ${stationName}<br>n_serie: ${nSerie}`
    );

    Plotly.newPlot(REALTIME_CONTAINER, [trace], layout, { responsive: true, displayModeBar: false });

  } catch (error) {
    console.error('Error loading realtime data:', error);
    showTabPlaceholder(`Error al cargar datos en tiempo real: ${error.message}`);
  }
}

/**
 * Show placeholder message in realtime tab
 *
 * @param {string} message - Message to display
 */
function showTabPlaceholder(message) {
  const container = document.getElementById(TAB_CONTAINER);
  if (container) {
    container.innerHTML = `<div class="flex items-center justify-center h-[200px] text-sm text-gray-400">${message}</div>`;
  }
}