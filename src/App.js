import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const GITHUB_TOKEN = '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';
const REPO_OWNER = 'harryfuller';
const REPO_NAME = 'stocktake-data';
const FILE_PATH = 'stocktake.csv';

function App() {
  const [csvData, setCsvData] = useState('');

  useEffect(() => {
    loadFromGitHub();
  }, []);

  async function getFileSHA() {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    const data = await res.json();
    return data.sha;
  }

  async function loadFromGitHub() {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      const data = await res.json();
      const csv = decodeURIComponent(escape(atob(data.content)));
      setCsvData(csv);
      console.log("✅ Loaded from GitHub");
    } catch (err) {
      console.warn("No saved file found, starting fresh.");
    }
  }

  async function saveToGitHub() {
    const encoded = btoa(unescape(encodeURIComponent(csvData)));
    let sha = null;
    try { sha = await getFileSHA(); } catch (_) {}

    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
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
    try {
      const sha = await getFileSHA();
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
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
