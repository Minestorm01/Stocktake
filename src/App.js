import React, { useState, useEffect } from 'react';
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
  const [filePath, setFilePath] = useState('');
  const [screen, setScreen] = useState('upload'); // upload | login | scan | summary
  const [staffId, setStaffId] = useState('');
  const [location, setLocation] = useState('');
  const [scannedItems, setScannedItems] = useState([]);

  useEffect(() => {
    const lastFile = localStorage.getItem('lastUsedFile');
    if (lastFile) {
      loadCsvFromGitHub(lastFile).then((data) => {
        if (data) {
          setCsvData(data);
          setFilePath(lastFile);
          setScreen('login');
        }
      });
    }
  }, []);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const uploadedName = file.name.replace(/\s+/g, '-').toLowerCase();
    setFilePath(uploadedName);
    localStorage.setItem('lastUsedFile', uploadedName);

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvData(event.target.result);
      setScreen('login');
    };
    reader.readAsText(file);
  }

  function startScanning() {
    setScannedItems([]);
    setScreen('scan');
  }

  function finishScanning() {
    setScreen('summary');
    const updatedCsv = appendScansToCsv(csvData, scannedItems);
    setCsvData(updatedCsv);
    saveCsvToGitHub(filePath, updatedCsv);
  }

  function appendScansToCsv(csv, scans) {
    const rows = Papa.parse(csv.trim(), { header: true }).data;
    scans.forEach(scan => {
      const match = rows.find(row => row.Code === scan);
      if (match) match.Counted = 'Yes';
    });
    return Papa.unparse(rows);
  }

  function handleDelete() {
    deleteCsvFromGitHub(filePath);
    setCsvData('');
    setFilePath('');
    setStaffId('');
    setLocation('');
    setScannedItems([]);
    setScreen('upload');
  }

  return (
    <div className="container">
      <header>
        <h1>Stocktake Memory Tool</h1>
      </header>

      {screen === 'upload' && (
        <main>
          <input type="file" accept=".csv" onChange={handleUpload} />
        </main>
      )}

      {screen === 'login' && (
        <main>
          <label>Staff ID:
            <input value={staffId} onChange={e => setStaffId(e.target.value)} />
          </label>
          <label>Location:
            <input value={location} onChange={e => setLocation(e.target.value)} />
          </label>
          <button onClick={startScanning}>Start Scanning</button>
        </main>
      )}

      {screen === 'scan' && (
        <Scanner
          scannedItems={scannedItems}
          setScannedItems={setScannedItems}
          onFinish={finishScanning}
        />
      )}

      {screen === 'summary' && (
        <main>
          <p>Welcome back, {staffId}. Location: {location}</p>
          <button onClick={() => setScreen('login')}>📦 Start New Scan</button>
          <Report csvData={csvData} onDelete={handleDelete} />
        </main>
      )}

      <footer>
        <p>&copy; {new Date().getFullYear()} Your Store Tools</p>
      </footer>
    </div>
  );
}

export default App;
