import React from 'react';
import Papa from 'papaparse';

function Report({ csvData, onDelete }) {
  const generateReport = () => {
    const parsed = Papa.parse(csvData, { header: true });
    const rows = parsed.data.filter(row => row['ITEM']);

    const reportMap = new Map();

    for (const row of rows) {
      const sku = row['ITEM'];
      const location = row['LOCATION'] || 'Unknown';
      const scanned = row['SCANNED/TYPED']?.toUpperCase() || 'S';
      const key = `${sku}_${location}`;

      if (!reportMap.has(key)) {
        reportMap.set(key, {
          ...row,
          'ACTUAL UNITS': 1,
          'COUNTED TWICE': false,
        });
      } else {
        const existing = reportMap.get(key);
        existing['ACTUAL UNITS'] += 1;
        existing['COUNTED TWICE'] = true;
      }
    }

    const enrichedData = Array.from(reportMap.values()).map(row => {
      const book = parseInt(row['BOOK UNITS'] || 0);
      const actual = parseInt(row['ACTUAL UNITS'] || 0);
      const variance = actual - book;

      return {
        'ITEM': row['ITEM'],
        'DESCRIPTION': row['DESCRIPTION'],
        'OLD SKU NO.': row['OLD SKU NO.'] || '',
        'STATUS': row['STATUS'] || 'A',
        'BOOK UNITS': book,
        'ACTUAL UNITS': actual,
        'VARIANCE UNITS': variance,
        'RETAIL PRICE': row['RETAIL PRICE'] || '',
        'PREVIOUS COUNT': row['PREVIOUS COUNT'] || '',
        'LOCATION': row['LOCATION'] || 'Unknown',
        'S/T': row['SCANNED/TYPED'] || 'S',
        'COUNTED TWICE': row['COUNTED TWICE'] ? '✓' : '',
        'TRANSFER FLAG': variance === 0 ? '' : (Math.abs(variance) <= 2 ? '⚠' : '')
      };
    });

    const csv = Papa.unparse(enrichedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'variance_report.csv');
    link.click();
  };

  return (
    <div className="report-section">
      <h2>📊 Variance Report</h2>
      <button onClick={generateReport}>📥 Generate CSV Report</button>
      <button onClick={onDelete}>🗑️ Reset Stocktake</button>
    </div>
  );
}

export default Report;
