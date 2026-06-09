/**
 * Application State Management
 * Single source of truth for all dashboard state.
 * Uses a simple observer pattern for reactive updates.
 */

import { ALL_HOURS } from './config.js';

class AppState {
  constructor() {
    // Data storage
    this._annualData = [];
    this._hourlyData = [];

    // Derived data
    this._regions = [];
    this._stationMeta = []; // [{ id, val, color }]

    // Active selections
    this._activeRegion = null;
    this._activeStation = null;
    this._activeStations = new Set();

    // Observer callbacks
    this._observers = new Map();
  }

  // === Getters ===

  get annualData() { return this._annualData; }
  get hourlyData() { return this._hourlyData; }
  get regions() { return this._regions; }
  get stationMeta() { return this._stationMeta; }
  get activeRegion() { return this._activeRegion; }
  get activeStation() { return this._activeStation; }
  get activeStations() { return this._activeStations; }

  get ALL_HOURS() { return ALL_HOURS; }

  // === Setters with notifications ===

  setAnnualData(data) {
    this._annualData = data;
    this._notify('annualData', data);
  }

  setHourlyData(data) {
    this._hourlyData = data;
    this._notify('hourlyData', data);
  }

  setRegions(regions) {
    this._regions = regions;
    this._notify('regions', regions);
  }

  setStationMeta(meta) {
    this._stationMeta = meta;
    this._notify('stationMeta', meta);
  }

  setActiveRegion(region) {
    this._activeRegion = region;
    this._notify('activeRegion', region);
  }

  setActiveStation(station) {
    this._activeStation = station;
    this._notify('activeStation', station);
  }

  setActiveStations(stations) {
    this._activeStations = stations;
    this._notify('activeStations', stations);
  }

  addActiveStation(station) {
    this._activeStations.add(station);
    this._notify('activeStations', this._activeStations);
  }

  removeActiveStation(station) {
    this._activeStations.delete(station);
    this._notify('activeStations', this._activeStations);
  }

  clearActiveStations() {
    this._activeStations.clear();
    this._notify('activeStations', this._activeStations);
  }

  // === Derived data helpers ===

  /**
   * Get stations for a specific region
   */
  getStationsForRegion(region) {
    if (!region) return [...new Set(this._annualData.map(d => d.Estacion))].sort();

    const filtered = this._annualData.filter(d => d.Region === region);
    return [...new Set(filtered.map(d => d.Estacion))].sort();
  }

  /**
   * Get annual data for a specific station
   */
  getAnnualDataForStation(stationName) {
    return this._annualData.filter(d => d.Estacion === stationName);
  }

  /**
   * Get hourly data for a specific station
   */
  getHourlyDataForStation(stationName) {
    return this._hourlyData.filter(d => d.Estacion === stationName);
  }

  /**
   * Get available years for a station from annual data
   */
  getYearsForStation(stationName) {
    const rows = this.getAnnualDataForStation(stationName);
    return [...new Set(rows.map(r => r.Anio))].sort();
  }

  /**
   * Get available years for a station from hourly data
   */
  getHourlyYearsForStation(stationName) {
    const data = this.getHourlyDataForStation(stationName);
    return [...new Set(data.map(d => d.Anio))].sort();
  }

  /**
   * Get noise value for station in a specific year (annual data)
   */
  getNoiseValue(stationName, year) {
    const found = this._annualData.find(d => d.Estacion === stationName && d.Anio === year);
    if (!found) return null;
    return parseFloat((found.Ruido_dB || '0').toString().replace(',', '.'));
  }

  /**
   * Get latest noise value for a station (most recent year)
   */
  getLatestNoiseValue(stationName) {
    const years = this.getYearsForStation(stationName);
    if (!years.length) return null;
    const latestYear = years[years.length - 1];
    return this.getNoiseValue(stationName, latestYear);
  }

  /**
   * Get n_serie for a station from most recent year
   */
  getStationSerie(stationName) {
    const rows = this.getAnnualDataForStation(stationName);
    if (!rows.length) return null;

    const sorted = rows.sort((a, b) => {
      const yearA = parseInt(a.Anio) || 0;
      const yearB = parseInt(b.Anio) || 0;
      return yearB - yearA;
    });

    return sorted[0]?.n_serie || null;
  }

  /**
   * Get hourly data for region in a specific year
   */
  getHourlyDataForRegion(regionName, year) {
    const stations = this.getStationsForRegion(regionName);
    return this._hourlyData.filter(d =>
      stations.includes(d.Estacion) && Number(d.Anio) === year
    );
  }

  /**
   * Get available years for a region
   */
  getYearsForRegion(regionName) {
    const stations = this.getStationsForRegion(regionName);
    const years = this._hourlyData
      .filter(d => stations.includes(d.Estacion))
      .map(d => Number(d.Anio));
    return [...new Set(years)].sort();
  }

  // === Observer pattern ===

  /**
   * Subscribe to state changes
   * @param {string} key - State key to observe
   * @param {Function} callback - Called when key changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._observers.has(key)) {
      this._observers.set(key, new Set());
    }
    this._observers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this._observers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  _notify(key, value) {
    const callbacks = this._observers.get(key);
    if (callbacks) {
      callbacks.forEach(cb => cb(value));
    }
  }

  // === Reset ===

  reset() {
    this._annualData = [];
    this._hourlyData = [];
    this._regions = [];
    this._stationMeta = [];
    this._activeRegion = null;
    this._activeStation = null;
    this._activeStations.clear();
  }
}

// Export singleton instance
export const state = new AppState();

// Also export class for testing if needed
export { AppState };