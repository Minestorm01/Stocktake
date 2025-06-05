import React, { useMemo } from 'react';
import Papa from 'papaparse';
import { parseCsvRows } from '../utils';

function buildReport(csvData) {
  const parsed = Papa.parse(csvData, { header: true });
  const rows = parsed.data.filter(r => r['ITEM']);
  const map = new Map();
  
  rows.forEach(row => {
    const sku = row['ITEM'];
    const location = row['LOCATION'] || 'Unknown';
    const flag = (row['SCANNED/TYPED'] || row['S/T'] || '').toUpperCase();
    const bookUnits = parseInt(row['BOOK UNITS'] || 0, 10);

    if (!map.has(sku)) {
      map.set(sku, {
        ITEM: sku,
        DESCRIPTION: row['DESCRIPTION'] || '',
        'OLD SKU NO.': row['OLD SKU NO.'] || '',
        STATUS: row['STATUS'] || 'A',
        'BOOK UNITS': 0,
        'ACTUAL UNITS': 0,
        locations: new Set(),
        'RETAIL PRICE': row['RETAIL PRICE'] || '',
        'PREVIOUS COUNT': row['PREVIOUS COUNT'] || '',
         countedTwice: false
      });
    }
    const item = map.get(sku);
    item.locations.add(location);
    if (flag === 'S' || flag === 'T') {
      item['ACTUAL UNITS'] += 1;
      if (item['ACTUAL UNITS'] > 1) item.countedTwice = true;
    } else if (!isNaN(bookUnits)) {
      item['BOOK UNITS'] += bookUnits;
    }
  });

  const data = [];
  map.forEach(item => {
    const variance = item['ACTUAL UNITS'] - item['BOOK UNITS'];
    data.push({
      ITEM: item.ITEM,
      DESCRIPTION: item.DESCRIPTION,
      'OLD SKU NO.': item['OLD SKU NO.'],
      STATUS: item.STATUS,
      'BOOK UNITS': item['BOOK UNITS'],
      'ACTUAL UNITS': item['ACTUAL UNITS'],
      'VARIANCE UNITS': variance,
      'RETAIL PRICE': item['RETAIL PRICE'],
      'PREVIOUS COUNT': item['PREVIOUS COUNT'],
      LOCATION: Array.from(item.locations).join(','),
      'COUNTED TWICE': item.countedTwice ? '✓' : '',
      'TRANSFER FLAG': variance === 0 ? '' : Math.abs(variance) <= 2 ? '⚠' : ''
    });
});
  return data;
}

function Report({ csvData, onDelete, onBack }) {
  const reportData = useMemo(() => buildReport(csvData), [csvData]);

     const download = () => {
    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'variance_report.csv');
    link.click();
  };

  return (
    <div className="report-section">
      <h2>📊 Variance Report</h2>
      {reportData.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {Object.keys(reportData[0]).map(key => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={download}>Download CSV</button>
      <button onClick={onBack}>Return to Login</button>
      <button onClick={onDelete}>Reset Stocktake</button>
    </div>
  );
}

export default Report;
