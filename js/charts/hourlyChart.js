/**
 * Hourly Profile Chart Module
 * Renders line charts for hourly noise profiles (station or region view).
 */

import { ALL_HOURS } from '../config.js';
import { state } from '../state.js';
import { buildHourlyLayout, createScatterTrace, getYearColor, getColor } from './layouts.js';
import { showPlaceholder } from '../utils/dom.js';

const HOURLY_CONTAINER = 'hourly-chart';

/**
 * Render hourly profile for a specific station
 * Shows all years available for that station
 *
 * @param {string} stationName - Station name
 */
export function renderStationHourly(stationName) {
  console.log('[HOURLY] renderStationHourly called for:', stationName);
  const container = document.getElementById('tab-horario');
  if (!container) {
    console.error('[HOURLY] tab-horario container not found');
    return;
  }

  console.log('[HOURLY] tab-horario container found, setting innerHTML');
  container.innerHTML = `
    <div class="flex flex-col gap-1.5">
      <h3 class="text-[15px] font-semibold text-gray-800">Perfil Horario: ${stationName}</h3>
      <p class="text-[13px] text-gray-500">Nivel de ruido promedio hora a hora · todos los años disponibles</p>
      <div id="${HOURLY_CONTAINER}" class="w-full mt-1.5" style="height:320px;"></div>
    </div>
  `;

  const stationHourlyData = state.getHourlyDataForStation(stationName);
  console.log('[HOURLY] stationHourlyData rows:', stationHourlyData.length);
  const years = [...new Set(stationHourlyData.map(d => d.Anio))].sort();
  console.log('[HOURLY] years found:', years);

  if (!years.length) {
    console.log('[HOURLY] No years found, showing placeholder');
    showPlaceholder(HOURLY_CONTAINER, 'No hay datos horarios para esta estación');
    return;
  }

  const traces = years.map((year, idx) => {
    const yearData = stationHourlyData.filter(d => d.Anio === year);
    const yValues = ALL_HOURS.map(hora => {
      const found = yearData.find(d => d.Hora === hora);
      return found ? parseFloat(found.Ruido_dB) : null;
    });
    const color = getYearColor(idx);
    console.log(`[HOURLY] Year ${year}: ${yValues.filter(v => v !== null).length}/24 hours with data`);
    return createScatterTrace(
      ALL_HOURS,
      yValues,
      `${year}`,
      color,
      { shape: 'line', hovertemplate: `<b>${year}</b>: %{y:.1f} dBA<extra></extra>` }
    );
  });

  console.log('[HOURLY] Calling Plotly.newPlot with', traces.length, 'traces');
  Plotly.newPlot(HOURLY_CONTAINER, traces, buildHourlyLayout(), { responsive: true, displayModeBar: false });
  console.log('[HOURLY] Plotly.newPlot completed');
}

/**
 * Render hourly profile for a region
 * Shows all stations in the region for the most recent available year
 *
 * @param {string} regionName - Region name
 */
export function renderRegionHourly(regionName) {
  console.log('[HOURLY] renderRegionHourly called for:', regionName);
  const container = document.getElementById('tab-horario');
  if (!container) {
    console.error('[HOURLY] tab-horario container not found');
    return;
  }

  console.log('[HOURLY] tab-horario container found, setting innerHTML');
  container.innerHTML = `
    <div class="flex flex-col gap-1.5">
      <h3 class="text-[15px] font-semibold text-gray-800">Perfil Horario: ${regionName}</h3>
      <p class="text-[13px] text-gray-500">Nivel de ruido promedio hora a hora · último año disponible</p>
      <div id="${HOURLY_CONTAINER}" class="w-full mt-1.5" style="height:320px;"></div>
    </div>
  `;

  const regionStations = state.getStationsForRegion(regionName);
  const years = state.getYearsForRegion(regionName);
  console.log('[HOURLY] regionStations:', regionStations);
  console.log('[HOURLY] years available:', years);

  if (!years.length) {
    console.log('[HOURLY] No years found, showing placeholder');
    showPlaceholder(HOURLY_CONTAINER, 'No hay datos horarios para esta región');
    return;
  }

  // Use the most recent year
  const lastYear = years[years.length - 1];
  console.log('[HOURLY] Using last year:', lastYear);

  const traces = regionStations.map((st, idx) => {
    const stationData = state.hourlyData.filter(d => d.Estacion === st && Number(d.Anio) === lastYear);
    const yValues = ALL_HOURS.map(hour => {
      const found = stationData.find(d => d.Hora === hour);
      return found ? parseFloat(found.Ruido_dB) : null;
    });
    const color = getColor(idx);
    console.log(`[HOURLY] Station ${st}: ${yValues.filter(v => v !== null).length}/24 hours with data`);
    return createScatterTrace(
      ALL_HOURS,
      yValues,
      st,
      color,
      { shape: 'line', hovertemplate: `<b>${st}</b> %{y:.1f} dBA<extra></extra>` }
    );
  });

  console.log('[HOURLY] Calling Plotly.newPlot with', traces.length, 'traces');
  Plotly.newPlot(HOURLY_CONTAINER, traces, buildHourlyLayout(), { responsive: true, displayModeBar: false });
  console.log('[HOURLY] Plotly.newPlot completed');
}