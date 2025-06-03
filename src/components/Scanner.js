// Scanner.js
import React, { useState } from 'react';
import memory from './memory';

export default function Scanner() {
  const [staffId, setStaffId] = useState('');
  const [location, setLocation] = useState('');
  const [barcode, setBarcode] = useState('');
  const [scanned, setScanned] = useState([]);

  const handleScan = () => {
    if (!barcode) return;
    const newItem = { barcode, timestamp: new Date().toISOString() };
    const updated = [...scanned, newItem];
    setScanned(updated);
    memory.save(location, staffId, updated);
    setBarcode('');
  };

  return (
    <div className="scanner">
      <h2>Scan Items</h2>
      <label>
        Staff ID:
        <input value={staffId} onChange={(e) => setStaffId(e.target.value)} />
      </label>
      <label>
        Location:
        <input value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <label>
        Barcode:
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
      </label>
      <button onClick={handleScan}>Scan</button>
      <ul>
        {scanned.map((item, index) => (
          <li key={index}>{item.barcode} ({item.timestamp})</li>
        ))}
      </ul>
    </div>
  );
}
