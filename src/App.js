import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import Scanner from './components/Scanner';
import Report from './components/Report';
import {
  loadCsvFromGitHub,
  saveCsvToGitHub,
  deleteCsvFromGitHub
} from './memory';

function App() {
  const [csvData, setCsvData] = useState('');
  const [staffId, setStaffId] = useState('');
  const [location, setLocation] = useState('');

  const fileSelected = staffId.trim() && location.trim();

  useEffect(() => {
    if (fileSelected) {
      loadCsvFromGitHub(staffId, location).then(data => {
        if (data) {
          setCsvData(data);
        } else {
          setCsvData('');
        }
      });
    }
  }, [staffId, location]);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvData(text);
    };
    reader.readAsText(file);
  }

  async function handleSave() {
    if (!fileSelected || !csvData) return alert('Missing staff/location or CSV data');
    await saveCsvToGitHub(staffId, location, csvData);
    alert('✅ Stocktake saved to memory!');
  }

  async function handleReset() {
    if (!fileSelected) return alert('Missing staff/location');
    await deleteCsvFromGitHub(staffId, location);
    setCsvData('');
    alert('🗑️ Stocktake reset');
  }

  return (
    <div>
      <h1>📦 Stocktake Tool</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Staff ID: &nbsp;
          <input
            type="text"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          />
        </label>
        &nbsp;&nbsp;
        <label>
          Location: &nbsp;
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
      </div>

      <input type="file" accept=".csv" onChange={handleUpload} />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleSave}>✅ Done with this section</button>
        <button onClick={handleReset} style={{ marginLeft: '1rem' }}>🗑️ Reset Stocktake</button>
      </div>

      {csvData && (
        <>
          <Scanner csvData={csvData} setCsvData={setCsvData} />
          <Report csvData={csvData} />
        </>
      )}
    </div>
  );
}

export default App;
