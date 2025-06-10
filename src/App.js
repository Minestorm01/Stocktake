import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Scanner from './components/Scanner';
import Report, { buildReport } from './components/Report';
import {
  loadCsvFromGitHub,
  saveCsvToGitHub,
  deleteCsvFromGitHub
} from './memory';

function App() {
  const [csvData, setCsvData] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileLoaded, setFileLoaded] = useState(false);
  const [screen, setScreen] = useState('login');
  const [showOptions, setShowOptions] = useState(false);
  const [staffNumber, setStaffNumber] = useState('');
  const [locationNumber, setLocationNumber] = useState('');
  const [loadName, setLoadName] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    const lastFile = localStorage.getItem('lastUsedFile');
    if (lastFile) {
      loadCsvFromGitHub(lastFile).then((data) => {
        if (data) {
          setCsvData(data);
          setFilePath(lastFile);
          setFileLoaded(true);
          setHasScanned(false);
          console.log(`📂 Auto-loaded ${lastFile} from memory.`);
        }
      });
    }
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedName = file.name.replace(/\s+/g, '-').toLowerCase();
    setFilePath(uploadedName);
    localStorage.setItem('lastUsedFile', uploadedName);

    const remote = await loadCsvFromGitHub(uploadedName);
    if (remote) {
      setCsvData(remote);
      setFileLoaded(true);
      setHasScanned(false);
      alert(`📂 Loaded saved version of ${uploadedName}`);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
        setFileLoaded(true);
        setHasScanned(false);
      };
      reader.readAsText(file);
    }
  }

  async function handleLoadExisting() {
    if (!loadName) return;
    const data = await loadCsvFromGitHub(loadName);
    if (data) {
      setCsvData(data);
      setFilePath(loadName);
      setFileLoaded(true);
      setHasScanned(false);
      localStorage.setItem('lastUsedFile', loadName);
    } else {
      alert('File not found');
    }
  }

  function handleCsvChange(newCsv) {
    setCsvData(newCsv);
    setHasScanned(true);
  }
  function downloadCsv() {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filePath || 'stocktake.csv');
    link.click();
  }

  function saveVarianceReport() {
    const dataRows = buildReport(csvData);
    const variancesOnly = dataRows.filter(r => r['VARIANCE UNITS'] !== 0);
    const columns = [
      'ITEM',
      'DESCRIPTION',
      'OLD SKU NO.',
      'STATUS',
      'BOOK UNITS',
      'ACTUAL UNITS',
      'VARIANCE UNITS',
      'RETAIL PRICE',
      'PREVIOUS COUNT',
      'LOCATION',
      'COUNTED TWICE',
      'TRANSFER FLAG'
    ];
    const content = Papa.unparse(variancesOnly, { columns });
    const defaultName = `variance-${Date.now()}.csv`;
    const name = prompt('Filename for save', defaultName);
    if (name) {
      const filename = name.endsWith('.csv') ? name : `${name}.csv`;
      saveCsvToGitHub(filename, content);
    }
  }

 
  function handleDelete() {
    deleteCsvFromGitHub(filePath);
    setCsvData('');
    setFileLoaded(false);
    setHasScanned(false);
    setScreen('login');
    setShowOptions(false);
  }

  return (
    <div className="container">
      <header>
        <h1>Stocktake Memory Tool</h1>
      </header>
      <main>
        {!fileLoaded ? (
          <div>
            <input type="file" accept=".csv" onChange={handleUpload} />
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Filename to load"
                value={loadName}
                onChange={(e) => setLoadName(e.target.value)}
              />
              <button onClick={handleLoadExisting} disabled={!loadName}>Load</button>
            </div>
          </div>
        ) : screen === 'login' ? (
          <div>
            <input
              type="number"
              placeholder="Staff Number"
              value={staffNumber}
              onChange={(e) => setStaffNumber(e.target.value)}
            />
            <input
              type="number"
              placeholder="Location Number"
              value={locationNumber}
              onChange={(e) => setLocationNumber(e.target.value)}
            />
            <button
              disabled={!staffNumber || !locationNumber}
              onClick={() => setScreen('scan')}
            >
              Start Scanning
            </button>
      {showOptions && (
              <div className="options">
                <button onClick={() => setScreen('report')}>Generate Variance Report</button>
                <button onClick={downloadCsv}>Download CSV</button>
                <button onClick={saveVarianceReport} disabled={!hasScanned}>Save Variances</button>
                <button onClick={handleDelete}>Reset Stocktake</button>
              </div>
            )}
          </div>
        ) : screen === 'scan' ? (
          <div>
            <Scanner
              csvData={csvData}
              onCsvChange={handleCsvChange}
              location={locationNumber}
              onItemScanned={() => setHasScanned(true)}
            />
                        <button onClick={() => { setScreen('login'); setShowOptions(true); }}>Finish Scanning</button>

          </div>
        ) : (
          <Report csvData={csvData} onDelete={handleDelete} onBack={() => setScreen('login')} />
        )}
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Your Store Tools</p>
      </footer>
    </div>
  );
}

export default App;
