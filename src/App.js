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
  const [fileLoaded, setFileLoaded] = useState(false);
  const [screen, setScreen] = useState('login');
  const [showOptions, setShowOptions] = useState(false);
  const [staffNumber, setStaffNumber] = useState('');
  const [locationNumber, setLocationNumber] = useState('');

  useEffect(() => {
    const lastFile = localStorage.getItem('lastUsedFile');
    if (lastFile) {
      loadCsvFromGitHub(lastFile).then((data) => {
        if (data) {
          setCsvData(data);
          setFilePath(lastFile);
          setFileLoaded(true);
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
      alert(`📂 Loaded saved version of ${uploadedName}`);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
        setFileLoaded(true);
      };
      reader.readAsText(file);
    }
  }

  function handleCsvChange(newCsv) {
    setCsvData(newCsv);
    saveCsvToGitHub(filePath, newCsv);
  }
  function downloadCsv() {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filePath || 'stocktake.csv');
    link.click();
  }

 
  function handleDelete() {
    deleteCsvFromGitHub(filePath);
    setCsvData('');
    setFileLoaded(false);
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
          <input type="file" accept=".csv" onChange={handleUpload} />
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

