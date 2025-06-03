import React, { useState } from 'react';

function Scanner({ scannedItems, setScannedItems, onFinish }) {
  const [input, setInput] = useState('');

  function handleScan() {
    const trimmed = input.trim();
    if (trimmed && !scannedItems.includes(trimmed)) {
      setScannedItems([...scannedItems, trimmed]);
    }
    setInput('');
  }

  function handleRemove(sku) {
    setScannedItems(scannedItems.filter(item => item !== sku));
  }

  return (
    <div className="scanner">
      <h2>📷 Scanner</h2>
      <input
        type="text"
        placeholder="Scan or enter SKU"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
      />
      <button onClick={handleScan}>Scan</button>

      <ul className="scanned-list">
        {scannedItems.map((item, idx) => (
          <li key={idx}>
            {item} <button onClick={() => handleRemove(item)}>❌</button>
          </li>
        ))}
      </ul>

      <button onClick={onFinish} style={{ marginTop: '20px' }}>✅ Finish Scanning</button>
    </div>
  );
}

export default Scanner;
