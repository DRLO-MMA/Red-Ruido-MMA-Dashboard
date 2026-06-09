/**
 * Data Loading Module
 * Handles fetching CSV data with fallback to mock data for local development.
 */

import { ANNUAL_URL, HOURLY_URL } from '../config.js';
import { parseCSV, generateMockAnnualCSV, generateMockHourlyCSV } from '../utils/csv.js';
import { state } from '../state.js';

/**
 * Load data from CSV files or generate mock data
 * Checks for file:// protocol to avoid CORS issues when opening locally
 *
 * @returns {Promise<void>}
 */
export async function loadData() {
  // Check if running locally via file:// protocol
  if (window.location.protocol === 'file:') {
    console.log('Running locally (file:// protocol), using mock data');
    const mockAnnual = generateMockAnnualCSV();
    const mockHourly = generateMockHourlyCSV();
    processData(mockAnnual, mockHourly);
    return;
  }

  try {
    const [annualRes, hourlyRes] = await Promise.all([
      fetch(ANNUAL_URL).then(r => {
        if (!r.ok) throw new Error('Datos anuales no encontrados');
        return r.text();
      }),
      fetch(HOURLY_URL).then(r => {
        if (!r.ok) throw new Error('Datos por hora no encontrados');
        return r.text();
      })
    ]);

    processData(annualRes, hourlyRes);
  } catch (err) {
    console.warn('Fallo fetch CSV, usando datos mock:', err);
    const mockAnnual = generateMockAnnualCSV();
    const mockHourly = generateMockHourlyCSV();
    processData(mockAnnual, mockHourly);
  }
}

/**
 * Process raw CSV data and populate application state
 *
 * @param {string} annualRaw - Raw annual CSV text
 * @param {string} hourlyRaw - Raw hourly CSV text
 */
export function processData(annualRaw, hourlyRaw) {
  // Parse CSV data
  const annualData = parseCSV(annualRaw);
  const hourlyData = parseCSV(hourlyRaw);

  // Update state
  state.setAnnualData(annualData);
  state.setHourlyData(hourlyData);

  // Extract unique regions
  const regions = [...new Set(annualData.map(d => d.Region))];
  state.setRegions(regions);

  // Set default active region
  const activeRegion = regions[0] || null;
  state.setActiveRegion(activeRegion);

  // Trigger initial renders via callbacks (will be set by app.js)
  if (window.renderRegions) window.renderRegions();
  if (window.renderStationsForRegion) window.renderStationsForRegion(activeRegion);
  if (window.renderNoiseChart) window.renderNoiseChart();
}