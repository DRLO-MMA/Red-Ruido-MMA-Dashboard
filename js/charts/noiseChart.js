/**
 * Annual Noise Chart Module
 * Renders bar charts for annual noise levels (regional or station view).
 */

import { state } from '../state.js';
import { buildNoiseChartLayout, createBarTrace, getColor } from './layouts.js';
import { showPlaceholder } from '../utils/dom.js';

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
}

/**
 * Render noise chart for a region (one bar per station)
 *
 * @param {string} containerId - Chart container element ID
 */
function renderRegionalNoiseChart(containerId) {
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