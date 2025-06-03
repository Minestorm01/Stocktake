import React, { useState } from 'react';
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

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedName = file.name.replace(/\s+/g, '-').toLowerCase();
    setFilePath(uploadedName);

    // Try to load existing memory file
    const remote = await loadCsvFromGitHub(uploadedName);
    if (remote) {
      setCsvData(remote);
      setFileLoaded(true);
      alert(`📂 Loaded saved version of ${uploadedName}`);
    } else {
      // Load uploaded file if no memory found
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
        setFileLoaded(true);
      };
      reader.readAsText(file);
    }
  }

  async function handleSave() {
    if (!filePath || !csvData) return alert('⛔ Upload a file first');
    await saveCsvToGitHub(filePath, csvData);
    alert('✅ Saved to memory!');
  }

  async function handleReset() {
    if (!filePath) return alert('⛔ Upload a file first');
    const success = await deleteCsvFromGitHub(filePath);
    if (success) {
      setCsvData('');
      setFileLoaded(false);
      alert('🗑️ File reset');
    } else {
      alert('⚠️ File not found or could not be deleted');
    }
  }

  return (
  <div className="App">
    <h1>Hello, world!</h1>
  </div>
);


export default App;
