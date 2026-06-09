/**
 * Shared Plotly Chart Layouts
 * Centralizes common layout configurations for consistency.
 */

import { ALL_HOURS, CHART_DEFAULTS, COLORS, YEAR_COLORS } from '../config.js';
import { state } from '../state.js';

/**
 * Build layout for hourly profile charts (both station and region views)
 *
 * @returns {Object} Plotly layout object
 */
export function buildHourlyLayout() {
  return {
    margin: { t: 20, r: 20, l: 50, b: 60 },
    autosize: true,
    shapes: [
      { type: 'rect', x0: '00:00', x1: '07:00', y0: 0, y1: 1, yref: 'paper', fillcolor: 'rgba(30,58,138,0.04)', line: { width: 0 } },
      { type: 'rect', x0: '07:00', x1: '21:00', y0: 0, y1: 1, yref: 'paper', fillcolor: 'rgba(251,191,36,0.05)', line: { width: 0 } },
      { type: 'rect', x0: '21:00', x1: '22:00', y0: 0, y1: 1, yref: 'paper', fillcolor: 'rgba(255,215,0,0.2)', line: { width: 0 } },
      { type: 'rect', x0: '22:00', x1: '23:00', y0: 0, y1: 1, yref: 'paper', fillcolor: 'rgba(30,58,138,0.04)', line: { width: 0 } }
    ],
    annotations: [
      { x: '03:00', y: 1, yref: 'paper', text: '🌙 Noche', showarrow: false, font: { size: 9, color: '#94a3b8' }, xanchor: 'center', yanchor: 'bottom' },
      { x: '12:00', y: 1, yref: 'paper', text: '☀️ Día', showarrow: false, font: { size: 9, color: '#94a3b8' }, xanchor: 'center', yanchor: 'bottom' },
      { x: '22:00', y: 1, yref: 'paper', text: '🌇 Tarde', showarrow: false, font: { size: 9, color: '#94a3b8' }, xanchor: 'center', yanchor: 'bottom' }
    ],
    xaxis: {
      title: 'Hora del día',
      categoryorder: 'array',
      categoryarray: ALL_HOURS,
      tickangle: 25,
      tickfont: { size: 9 },
      gridcolor: '#f1f5f9',
      showline: true,
      linecolor: '#e2e8f0'
    },
    yaxis: {
      title: 'Nivel de Ruido, dBA',
      range: CHART_DEFAULTS.yAxisRange,
      gridcolor: '#e2e8f0',
      tickfont: { size: 9 },
      zeroline: false
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    hovermode: 'x unified',
    legend: {
      orientation: 'h',
      y: -0.4
    }
  };
}

/**
 * Build layout for annual noise bar chart
 *
 * @param {string} title - Chart title
 * @param {boolean} isStationView - True for station view, false for regional view
 * @returns {Object} Plotly layout object
 */
export function buildNoiseChartLayout(title, isStationView = true) {
  const xAxisTitle = isStationView ? 'Año' : 'Estación';

  return {
    title: {
      text: title,
      font: {
        size: isStationView ? 14 : 12,
        weight: 200
      },
      x: 0.5
    },
    margin: CHART_DEFAULTS.margin,
    autosize: true,
    xaxis: {
      title: {
        text: xAxisTitle,
        font: { size: 10 }
      },
      type: 'category',
      tickfont: { size: 9 },
      gridcolor: '#f1f5f9',
      showline: true,
      linecolor: '#e2e8f0',
      tickangle: isStationView ? 0 : 20
    },
    yaxis: {
      title: {
        text: isStationView ? 'Nivel de Ruido, dBA' : 'Nivel de ruido Dia-Tarde-Noche, dBA',
        font: { size: 10 }
      },
      range: CHART_DEFAULTS.yAxisRange,
      gridcolor: '#e8e8e4',
      zeroline: false,
      ticksuffix: '',
      tickfont: { size: 9 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: false
  };
}

/**
 * Build layout for realtime line chart
 *
 * @param {string} title - Chart title
 * @returns {Object} Plotly layout object
 */
export function buildRealtimeChartLayout(title) {
  return {
    title: {
      text: title,
      font: {
        size: 14,
        weight: 200
      },
      x: 0.5
    },
    margin: CHART_DEFAULTS.margin,
    autosize: true,
    xaxis: {
      title: {
        text: 'Fecha y Hora',
        font: { size: 10 }
      },
      type: 'date',
      tickfont: { size: 9 },
      gridcolor: '#f1f5f9',
      showline: true,
      linecolor: '#e2e8f0'
    },
    yaxis: {
      title: {
        text: 'Nivel de Ruido, dBA',
        font: { size: 10 }
      },
      range: CHART_DEFAULTS.yAxisRange,
      gridcolor: '#e8e8e4',
      zeroline: false,
      ticksuffix: '',
      tickfont: { size: 9 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: false
  };
}

/**
 * Get color for a specific index from the main palette
 *
 * @param {number} index - Color index
 * @returns {string} Hex color
 */
export function getColor(index) {
  return COLORS[index % COLORS.length];
}

/**
 * Get color for a specific year index
 *
 * @param {number} index - Year index
 * @returns {string} Hex color
 */
export function getYearColor(index) {
  return YEAR_COLORS[index % YEAR_COLORS.length];
}

/**
 * Create bar trace for noise chart
 *
 * @param {Array<string>} x - X-axis values (years or station names)
 * @param {Array<number>} y - Y-axis values (noise levels)
 * @param {Array<string>} colors - Colors for each bar
 * @param {Array<string>} text - Text labels for bars
 * @returns {Object} Plotly trace object
 */
export function createBarTrace(x, y, colors, text) {
  return {
    x,
    y,
    type: 'bar',
    marker: { color: colors, line: { width: 0 } },
    text,
    textposition: 'outside',
    textfont: { size: 10 },
    hovertemplate: '<b>%{x}</b><extra></extra>'
  };
}

/**
 * Create scatter trace for hourly/line charts
 *
 * @param {Array<string>} x - X-axis values (hours or dates)
 * @param {Array<number>} y - Y-axis values
 * @param {string} name - Trace name
 * @param {string} color - Line color
 * @param {Object} options - Additional options
 * @returns {Object} Plotly trace object
 */
export function createScatterTrace(x, y, name, color, options = {}) {
  return {
    x,
    y,
    name,
    type: 'scatter',
    mode: options.mode || 'lines+markers',
    connectgaps: options.connectgaps !== false,
    line: {
      shape: options.shape || 'line',
      width: options.width || 1.5,
      color
    },
    marker: {
      size: options.markerSize || 3,
      color,
      symbol: options.symbol || 'circle'
    },
    hovertemplate: options.hovertemplate || `<b>${name}</b>: %{y:.1f} dBA<extra></extra>`
  };
}