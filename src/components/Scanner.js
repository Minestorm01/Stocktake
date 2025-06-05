import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

function Scanner({ csvData, onCsvChange, location }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [baseRows, setBaseRows] = useState([]);
  const [inputValue, setInputValue] = useState('');
 
// Load the base CSV rows only when no scans exist
  useEffect(() => {
 if (scannedItems.length === 0) {
      const parsed = Papa.parse(csvData, { header: true });
      const rows = parsed.data.filter(row => row['ITEM']);
      setBaseRows(rows);
    }
  }, [csvData]);

  const handleScan = () => {
    if (!inputValue.trim()) return;
    const newItem = {
      id: Date.now() + Math.random(), // Unique ID to allow individual deletion
      ITEM: inputValue.trim(),
      LOCATION: location || 'Unknown',
      'SCANNED/TYPED': 'S',
    };
    setScannedItems(prev => [...prev, newItem]);
    setInputValue('');
  };

  const handleDelete = (idToRemove) => {
    setScannedItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  useEffect(() => {
    if (baseRows.length === 0 && csvData) {
      const parsed = Papa.parse(csvData, { header: true });
      setBaseRows(parsed.data.filter(row => row['ITEM']));
    }


    const updatedData = [...baseRows, ...scannedItems];
    if (updatedData.length > 0) {
      const newCsv = Papa.unparse(updatedData);
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
