/**
 * Annual Noise Chart Module
 * Renders bar charts for annual noise levels (regional or station view).
 */

import { state } from '../state.js';
import { buildNoiseChartLayout, createBarTrace, getColor } from './layouts.js';
import { showPlaceholder } from '../utils/dom.js';
import { getStationInfo } from '../data/stationInfo.js';

/**
 * Render the annual noise level chart
 * Handles both:
 * - Station view: bars per year for selected station
 * - Regional view: bars per station for selected region
 */
export function renderNoiseChart() {
  const containerId = 'ruido-chart';

  if (state.activeStation) {
    // Individual station view: bars per year
    renderStationNoiseChart(containerId);
  } else {
    // Regional view: one bar per station
    renderRegionalNoiseChart(containerId);
  }
}

/**
 * Render noise chart for a specific station (bars per year)
 *
 * @param {string} containerId - Chart container element ID
 */
function renderStationNoiseChart(containerId) {
  const stationName = state.activeStation;
  const rows = state.getAnnualDataForStation(stationName);
  const years = [...new Set(rows.map(r => r.Anio))].sort();

  if (!years.length) {
    showPlaceholder(containerId, 'No hay datos anuales para esta estación', 'flex items-center justify-center h-[350px] text-sm text-gray-400');
    document.getElementById('station-info')?.classList.add('hidden');
    return;
  }

  const values = years.map(y => {
    const found = rows.find(r => r.Anio === y);
    return found ? parseFloat((found.Ruido_dB || '0').toString().replace(',', '.')) : null;
  });

  const trace = createBarTrace(
    years,
    values,
    years.map((_, i) => getColor(i)),
    values.map(v => v !== null ? v.toFixed(1) + ' dBA' : '')
  );

  const layout = buildNoiseChartLayout(`Nivel de ruido anual<br>${stationName}`, true);

  Plotly.newPlot(containerId, [trace], layout, { responsive: true, displayModeBar: false });

  displayStationInfo(stationName);
}

/**
 * Render noise chart for a region (one bar per station)
 *
 * @param {string} containerId - Chart container element ID
 */
function renderRegionalNoiseChart(containerId) {
  document.getElementById('station-info')?.classList.add('hidden');

  const visible = state.stationMeta.filter(s => state.activeStations.has(s.id));

  if (!visible.length) {
    showPlaceholder(containerId, 'No hay estaciones para mostrar', 'flex items-center justify-center h-[350px] text-sm text-gray-400');
    return;
  }

  const trace = createBarTrace(
    visible.map(s => s.id),
    visible.map(s => s.val),
    visible.map(s => s.color),
    visible.map(s => s.val + ' dBA')
  );

  const layout = buildNoiseChartLayout(`${state.activeRegion || 'Todas las regiones'}`, false);

  Plotly.newPlot(containerId, [trace], layout, { responsive: true, displayModeBar: false });
}

/**
 * Display station info (description + optional image) below the chart
 *
 * @param {string} stationName - Station name
 */
async function displayStationInfo(stationName) {
  const container = document.getElementById('station-info');
  if (!container) return;

  try {
    const info = await getStationInfo(stationName);

    if (!info) {
      container.classList.add('hidden');
      return;
    }

    const hasDesc = info.Descripcion && info.Descripcion.trim();
    const hasImage = info.Imagen && info.Imagen.trim();

    if (!hasDesc && !hasImage) {
      container.classList.add('hidden');
      return;
    }

    if (!hasDesc && hasImage) {
      container.innerHTML = `
        <div class="flex justify-center p-3 bg-white rounded-lg">
          <img src="${info.Imagen}" alt="${stationName}" class="max-w-full h-auto rounded" style="max-height:300px; object-fit:contain" onerror="this.outerHTML='<div class=\\'flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded h-32 w-full\\'>Sin imagen</div>'">
        </div>`;
    } else {
      container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-4 p-3 bg-white rounded-lg">
          <div class="flex-1 text-sm text-gray-700 leading-relaxed">${info.Descripcion}</div>
          ${hasImage
            ? `<div class="w-full md:w-48 flex-shrink-0"><img src="${info.Imagen}" alt="${stationName}" class="w-full h-auto rounded" style="max-height:300px; object-fit:contain" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-32 flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded\\'>Sin imagen</div>'"></div>`
            : `<div class="w-full md:w-48 flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded h-32">Sin imagen</div>`
          }
        </div>`;
    }
    container.classList.remove('hidden');
  } catch {
    container.classList.add('hidden');
  }
}