import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

function Scanner({ csvData, onCsvChange, location }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const parsed = Papa.parse(csvData, { header: true });
    const rows = parsed.data.filter(row => row['ITEM']);
    setScannedItems([]); // Reset scanned items on load
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
    const parsed = Papa.parse(csvData, { header: true });
    const baseData = parsed.data.filter(row => row['ITEM']);

    // Merge scanned data back into CSV for saving
    const updatedData = [...baseData, ...scannedItems];
    const newCsv = Papa.unparse(updatedData);
    onCsvChange(newCsv);
  }, [scannedItems]);

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
""")
