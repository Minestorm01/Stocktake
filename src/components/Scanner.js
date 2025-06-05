import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { parseCsvRows } from '../utils';


function Scanner({ csvData, onCsvChange, location }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [baseRows, setBaseRows] = useState([]);
  const [inputValue, setInputValue] = useState('');
 
// Load the base CSV rows only when no scans exist
  useEffect(() => {
 if (scannedItems.length === 0) {
     if (scannedItems.length === 0 && csvData) {
      const rows = parseCsvRows(csvData);
      setBaseRows(rows);
    }
  }, [csvData]);

  const handleScan = () => {
    if (!inputValue.trim()) return;
     const sku = inputValue.trim();
    const base = baseRows.find(row => row['ITEM'] === sku) || {};
    const newItem = {
      id: Date.now() + Math.random(), // Unique ID to allow individual deletion
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

  useEffect(() => {
    if (baseRows.length === 0 && csvData) {
      if (baseRows.length === 0 && csvData) {
      setBaseRows(parseCsvRows(csvData));
    }

 const exportRows = [
      ...baseRows,
      ...scannedItems.map(({ id, ...rest }) => rest),
    ];
    if (exportRows.length > 0) {
      const newCsv = Papa.unparse(exportRows);
      onCsvChange(newCsv);
    }
  }, [scannedItems, baseRows]);

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
        {scannedItems.map((item, index) => (
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
