/**
 * CSV Parsing and Mock Data Generation
 * Handles CSV parsing with auto-detected delimiter (; or ,)
 * and Spanish decimal format (comma) normalization.
 */

/**
 * Parse CSV text into array of objects
 * Auto-detects separator (; or ,) from first line
 * Normalizes Spanish decimal format (68,5 -> 68.5)
 *
 * @param {string} text - Raw CSV text
 * @returns {Array<Object>} Parsed rows as objects
 */
export function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(sep).map(v => v.trim());
    return headers.reduce((acc, header, i) => {
      let value = values[i] || '';
      // Normalize Spanish decimal format: "68,5" -> "68.5"
      if (/^\d+,\d+$/.test(value)) {
        value = value.replace(',', '.');
      }
      acc[header] = value;
      return acc;
    }, {});
  });
}

/**
 * Generate mock annual CSV data for development/fallback
 * Creates data for 3 regions, 6 stations, 2 years
 *
 * @returns {string} CSV text with semicolon delimiter
 */
export function generateMockAnnualCSV() {
  const mockRegions = ['REGION_1', 'REGION_2', 'REGION_3'];
  const mockStations = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];
  const years = [2023, 2024];
  const rows = ['Region;Estacion;Anio;Ruido_dB'];

  mockRegions.forEach((r, ri) => {
    mockStations.forEach((s, si) => {
      years.forEach(y => {
        const base = 50 + si * 3 + ri * 2;
        const val = (base + (y - 2023) + (Math.random() * 4 - 2)).toFixed(1).replace('.', ',');
        rows.push(`${r};${s};${y};${val}`);
      });
    });
  });

  return rows.join('\r\n');
}

/**
 * Generate mock hourly CSV data for development/fallback
 * Creates realistic diurnal noise curves for 6 stations, 3 years, 24 hours
 *
 * @returns {string} CSV text with semicolon delimiter
 */
export function generateMockHourlyCSV() {
  const mockStations = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];
  const years = [2023, 2024, 2025];
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');
  const rows = ['Estacion;Anio;Hora;Ruido_dB'];

  mockStations.forEach((st, si) => {
    years.forEach(year => {
      hours.forEach(hora => {
        const h = parseInt(hora);
        const base = 45 + si * 2;
        // Diurnal curve: morning peak ~8h, evening peak ~18h
        const curve = base
          + 10 * Math.exp(-0.5 * Math.pow((h - 8) / 3, 2))
          + 8 * Math.exp(-0.5 * Math.pow((h - 18) / 2, 2));
        const val = (curve + (Math.random() - 0.5) * 2).toFixed(1).replace('.', ',');
        rows.push(`${st};${year};${hora};${val}`);
      });
    });
  });

  return rows.join('\r\n');
}