// Report.js — Displays scanned items based on selected staffId and location

import React, { useState, useEffect } from 'react';
import memory from './memory';

function Report({ staffId, location }) {
  const [scannedItems, setScannedItems] = useState([]);

  useEffect(() => {
    if (staffId && location) {
      const data = memory.getData(staffId, location);
      setScannedItems(data || []);
    }
  }, [staffId, location]);

  const exportToCSV = () => {
    const rows = [
      ['Barcode', 'Timestamp'],
      ...scannedItems.map(({ barcode, timestamp }) => [barcode, timestamp]),
    ];

    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stocktake-${staffId}-${location}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h3>Variance Report</h3>
      {scannedItems.length === 0 ? (
        <p>No items scanned.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {scannedItems.map((item, index) => (
              <tr key={index}>
                <td>{item.barcode}</td>
                <td>{item.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={exportToCSV}>Export to CSV</button>
    </div>
  );
}

export default Report;
