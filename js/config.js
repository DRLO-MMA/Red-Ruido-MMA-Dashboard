/**
 * Configuration constants for Red Ruido MMA Dashboard
 * Centralizes URLs, color palettes, and CSS class strings.
 */

// Data source URLs
export const ANNUAL_URL = 'DATA/datos_anuales.csv';
export const HOURLY_URL = 'DATA/perfiles_horarios.csv';
export const REALTIME_URL_PREFIX = '/api/realtime/';
export const REALTIME_URL_SUFFIX = '';

// Color palettes for charts
export const COLORS = [
  '#6b8fd8', '#a78bd4', '#e8a040', '#d4c240', '#e84080',
  '#d440a0', '#40c8c8', '#40b878', '#78b840', '#8a8a20',
  '#c87a18', '#e8a080', '#DE4AD5', '#38B5BC', '#FAE5F9',
  '#A71E9F', '#D576A0', '#6ED874', '#305B91'
];

export const YEAR_COLORS = [
  '#00429d', '#3e67ae', '#618fbf', '#85b7ce', '#b1dfdb', '#ffffe0'
];

// CSS class strings for consistent styling
export const CSS_CLASSES = {
  // Region buttons
  regionBtnBase: 'region-btn px-5 py-2 rounded-lg border-2 text-[12px] font-medium cursor-pointer transition-all',
  regionBtnActive: 'bg-[#26b6a2] text-white border-[#26b6a2]',
  regionBtnInactive: 'bg-transparent text-[#000000] border-[#26b6a2] hover:bg-[#26b6a2]',

  // Station buttons
  stationBtnBase: 'station-btn px-1 py-1 h-[48px] rounded-lg border-2 border-[#26b6a2] text-black text-[9px] md:text-[12px] font-normal overflow-hidden text-ellipsis cursor-pointer transition-all text-center hover:bg-[#26b6a2] hover:border-[#26b6a2]',
  stationBtnActive: 'text-white bg-[#26b6a2]',
  stationBtnInactive: 'text-black',

  // Tab buttons
  tabBtnBase: 'tab-btn px-4 py-1 text-[12px] font-medium rounded-t-md mr-1 transition-colors',
  tabBtnActive: 'bg-[#2c2c2a] text-white',
  tabBtnInactive: 'bg-[#d1cfc6] text-[#5f5e5a] hover:bg-[#b4b2a9]',

  // Error messages
  errorMsg: 'px-2 py-2 rounded-lg text-[#3b6d11] text-[15px] font-medium',

  // Placeholder messages
  placeholderMsg: 'flex items-center justify-center h-[200px] text-sm text-gray-400'
};

// Chart configuration defaults
export const CHART_DEFAULTS = {
  noiseChartHeight: 350,
  hourlyChartHeight: 320,
  realtimeChartHeight: 350,
  yAxisRange: [40, 85],
  margin: { t: 50, r: 20, l: 55, b: 50 },
  fontFamily: 'Inter, sans-serif'
};

// All hours for hourly charts (00:00 - 23:00)
export const ALL_HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0') + ':00'
);