import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import Scanner from './components/Scanner';
import Report, { buildReport } from './components/Report';
import {
  loadCsvFromGitHub,
  saveCsvToGitHub,
  deleteCsvFromGitHub,
  parseVarianceCsv
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
  const varianceInputRef = useRef(null);
  const oldInputRef = useRef(null);

 
  useEffect(() => {
    const lastFile = localStorage.getItem('lastUsedFile');
    if (lastFile && lastFile !== 'untitled-spreadsheet---page-1.csv') {
      console.log(`🔄 Attempting auto-load of ${lastFile}`);
      loadCsvFromGitHub(lastFile, true).then((data) => {
        if (data) {
          setCsvData(data);
          setFilePath(lastFile);
          setFileLoaded(true);
          setHasScanned(false);
          console.log(`📂 Auto-loaded ${lastFile} from memory.`);
        } else {
          localStorage.removeItem('lastUsedFile');
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
    console.log(`⬆️ Uploading ${uploadedName}`);

    // reset session state when new file chosen
    setStaffNumber('');
    setLocationNumber('');
    setScreen('login');
    setShowOptions(false);

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
    function handleVarianceUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedName = file.name.replace(/\s+/g, "-").toLowerCase();
    setFilePath(uploadedName);
    localStorage.setItem("lastUsedFile", uploadedName);
    console.log(`⬆️ Importing variance ${uploadedName}`);

    setStaffNumber("");
    setLocationNumber("");
    setScreen("login");
    setShowOptions(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = parseVarianceCsv(event.target.result);
      setCsvData(csv);
      setFileLoaded(true);
      setHasScanned(false);
    };
    reader.readAsText(file);
    e.target.value = null;
  }

  function handleOldUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedName = file.name.replace(/\s+/g, '-').toLowerCase();
    setFilePath(uploadedName);
    localStorage.setItem('lastUsedFile', uploadedName);
    console.log(`📂 Loading old stocktake ${uploadedName}`);

    setStaffNumber('');
    setLocationNumber('');
    setScreen('login');
    setShowOptions(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = parseVarianceCsv(event.target.result);
      setCsvData(csv);
      setFileLoaded(true);
      setHasScanned(false);
      try {
        localStorage.setItem('stocktake_' + uploadedName, csv);
        console.log(`💾 Saved ${uploadedName} to localStorage`);
      } catch (err) {
        console.error('Failed to store file', err);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
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
      setStaffNumber('');
      setLocationNumber('');
      setScreen('login');
      setShowOptions(false);
      console.log(`📂 Loaded existing ${loadName}`);
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
    localStorage.removeItem('lastUsedFile');
    setCsvData('');
    setFileLoaded(false);
    setHasScanned(false);
    setScreen('login');
    setShowOptions(false);
    setStaffNumber('');
    setLocationNumber('');
    setLoadName('');
    setFilePath('');
    console.log('🗑️ Stocktake reset');
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
            <button onClick={() => varianceInputRef.current && varianceInputRef.current.click()} style={{ marginLeft: '10px' }}>
              🧩 Continue From Variance CSV
            </button>
            <button onClick={() => oldInputRef.current && oldInputRef.current.click()} style={{ marginLeft: '10px' }}>
              📂 Load Old Stocktake
            </button>
            <input
              type="file"
              accept=".csv"
              ref={varianceInputRef}
              style={{ display: 'none' }}
              onChange={handleVarianceUpload}
            />
            <input
              type="file"
              accept=".csv"
              ref={oldInputRef}
              style={{ display: 'none' }}
              onChange={handleOldUpload}
            />
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
