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

  function handleDelete() {
    deleteCsvFromGitHub(filePath);
    setCsvData('');
    setFileLoaded(false);
  }

  return (
    <div className="container">
      <header>
        <h1>Stocktake Memory Tool</h1>
      </header>
      <main>
        <input type="file" accept=".csv" onChange={handleUpload} />
        {fileLoaded ? (
          <>
            <Scanner csvData={csvData} onCsvChange={handleCsvChange} />
            <Report csvData={csvData} onDelete={handleDelete} />
          </>
        ) : (
          <p>📤 Upload a CSV file to get started</p>
        )}
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Your Store Tools</p>
      </footer>
    </div>
  );
}

export default App;
