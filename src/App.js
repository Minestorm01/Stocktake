import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const GITHUB_TOKEN = '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';
const REPO_OWNER = 'harryfuller';
const REPO_NAME = 'stocktake-data';

function App() {
  const [csvData, setCsvData] = useState('');
  const [storeId, setStoreId] = useState('');
  const [filePath, setFilePath] = useState('');

  useEffect(() => {
    if (storeId.trim()) {
      setFilePath(`${storeId.trim().toLowerCase().replace(/\s+/g, '-')}.csv`);
      loadFromGitHub(`${storeId.trim().toLowerCase().replace(/\s+/g, '-')}.csv`);
    }
  }, [storeId]);

  async function getFileSHA(path) {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    const data = await res.json();
    return data.sha;
  }

  async function loadFromGitHub(path) {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      const data = await res.json();
      const csv = decodeURIComponent(escape(atob(data.content)));
      setCsvData(csv);
      console.log("✅ Loaded from GitHub");
    } catch (err) {
      console.warn("No saved file found, starting fresh.");
      setCsvData('');
    }
  }

  async function saveToGitHub() {
    if (!filePath) return alert('❗ Select a store ID first');

    const encoded = btoa(unescape(encodeURIComponent(csvData)));
    let sha = null;
    try { sha = await getFileSHA(filePath); } catch (_) {}

    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update stocktake',
        content: encoded,
        ...(sha && { sha })
      })
    });

    if (res.ok) alert('✅ Stocktake saved!');
    else alert('❌ Save failed');
  }

  async function resetStocktake() {
    if (!filePath) return alert('❗ Select a store ID first');

    try {
      const sha = await getFileSHA(filePath);
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Reset stocktake',
          sha: sha
        })
      });

      if (res.ok) {
        setCsvData('');
        alert('🗑️ Stocktake reset');
      } else {
        alert('❌ Reset failed');
      }
    } catch (err) {
      alert('⚠️ Nothing to reset');
    }
  }

  return (
    <div>
      <h1>📦 Stocktake Tool</h1>

      <label>
        Store ID:&nbsp;
        <input
          type="text"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          placeholder="e.g. Woden, Albury"
        />
      </label>

      <br /><br />

      <textarea
        value={csvData}
        onChange={(e) => setCsvData(e.target.value)}
        rows={20}
        cols={80}
        placeholder="Paste or load your CSV here"
      />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={saveToGitHub}>✅ Done with this section</button>
        <button onClick={resetStocktake} style={{ marginLeft: '1rem' }}>🗑️ Reset Stocktake</button>
      </div>
    </div>
  );
}

export default App;

