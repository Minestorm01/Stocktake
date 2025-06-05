import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { parseCsvRows } from '../utils';

function Scanner({ csvData, onCsvChange, location }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [baseRows, setBaseRows] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Load base CSV rows when component mounts or csvData changes
  useEffect(() => {
    if (csvData && baseRows.length === 0) {
      const rows = parseCsvRows(csvData);
      setBaseRows(rows);
    }
  }, [csvData, baseRows.length]);

  const handleScan = () => {
    const sku = inputValue.trim();
    if (!sku) return;

    const base = baseRows.find(row => row['ITEM'] === sku) || {};
    const newItem = {
      id: Date.now() + Math.random(), // Unique ID
      ...base,
      ITEM: sku,
      LOCATION: location || base['LOCATION'] || 'Unknown',
      'SCANNED/TYPED': 'S',
      'BOOK UNITS': 0,
    };

    setScannedItems(prev => [...prev, newItem]);
    setInputValue('');
  };

  const handleDelete = (idToRemove) => {
    setScannedItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  // Generate updated CSV when scannedItems or baseRows change
  useEffect(() => {
    const exportRows = [
      ...baseRows,
      ...scannedItems.map(({ id, ...rest }) => rest),
    ];

    if (exportRows.length > 0) {
      let columns = baseRows.length > 0 ? Object.keys(baseRows[0]) : [];
      scannedItems.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key === 'id') return;
          if (!columns.includes(key)) columns.push(key);
        });
      });
      if (!columns.includes('SCANNED/TYPED')) columns.push('SCANNED/TYPED');
      const newCsv = Papa.unparse(exportRows, { columns });
      onCsvChange(newCsv);
    }
  }, [scannedItems, baseRows, onCsvChange]);

  return (
    <div className="scanner">
      <h2>📦 Scan Items</h2>
      <input
        type="text"
        placeholder="Scan SKU or enter manually"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
      />
      <button onClick={handleScan}>➕ Add</button>

      <ul className="scanned-list">
        {scannedItems.map(item => (
          <li key={item.id}>
            {item.ITEM} — {item.LOCATION}
            <button onClick={() => handleDelete(item.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Scanner;
