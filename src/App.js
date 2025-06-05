import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Scanner from './components/Scanner';
import Report from './components/Report';
import VarianceReport from './components/VarianceReport';
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
  const [staffNumber, setStaffNumber] = useState('');
  const [locationNumber, setLocationNumber] = useState('');
  const [showVariance, setShowVariance] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);

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

  function handleCsvChange(newCsv, updatedScannedItems = []) {
    setCsvData(newCsv);
    setScannedItems(updatedScannedItems);
    saveCsvToGitHub(filePath, newCsv);
  }

  function handleDelete() {
    deleteCsvFromGitHub(filePath);
    setCsvData('');
    setFileLoaded(false);
    setScreen('login');
  }

  function resetStocktake() {
    setScreen('login');
    setStaffNumber('');
    setLocationNumber('');
    setScannedItems([]);
    setShowVariance(false);
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
          </div>
        ) : screen === 'scan' ? (
          <div>
            <Scanner
              csvData={csvData}
              onCsvChange={handleCsvChange}
              location={locationNumber}
              onDone={() => setScreen('options')}
            />
            <button onClick={() => setScreen('options')}>Finish Scanning</button>
          </div>
        ) : screen === 'options' ? (
          <div>
            <Report csvData={csvData} onDelete={handleDelete} />
            <button onClick={() => setShowVariance(true)}>Generate Variance Report</button>
            <button onClick={resetStocktake}>Reset Stocktake</button>
            <button onClick={() => setScreen('login')}>Return to Login</button>
          </div>
        ) : null}

        {showVariance && (
          <div className="variance-window">
            <VarianceReport scannedData={scannedItems} />
          </div>
        )}
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Your Store Tools</p>
      </footer>
    </div>
  );
}

export default App;
