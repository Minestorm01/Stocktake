import React, { useState } from 'react';
//import './Scanner.css';

function Scanner({ onCompleteScan, csvData, onCsvChange }) {
  const [scannedSKUs, setScannedSKUs] = useState([]);
  const [currentSKU, setCurrentSKU] = useState('');

  const handleScan = (e) => {
    e.preventDefault();
    if (!currentSKU.trim()) return;
    setScannedSKUs((prev) => [...prev, currentSKU.trim()]);
    setCurrentSKU('');
  };

  const removeSKU = (sku) => {
    setScannedSKUs((prev) => prev.filter((item) => item !== sku));
  };

  const finishScanning = () => {
    // Integrate scanned SKUs into CSV logic if needed here
    onCompleteScan();
  };

  return (
    <div className="scanner">
      <h2>Scan Products</h2>
      <form onSubmit={handleScan}>
        <input
          type="text"
          placeholder="Scan or enter SKU"
          value={currentSKU}
          onChange={(e) => setCurrentSKU(e.target.value)}
          autoFocus
        />
        <button type="submit">Add</button>
      </form>

      <div className="scanned-list">
        <h3>Scanned SKUs:</h3>
        {scannedSKUs.length === 0 ? (
          <p>No SKUs scanned yet.</p>
        ) : (
          <ul>
            {scannedSKUs.map((sku, idx) => (
              <li key={idx}>
                {sku}
                <button onClick={() => removeSKU(sku)} className="remove-btn">❌</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="finish-btn" onClick={finishScanning}>✅ Finish Scanning</button>
    </div>
  );
}

export default Scanner;
