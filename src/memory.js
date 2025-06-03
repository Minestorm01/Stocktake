// memory.js
const GITHUB_TOKEN = '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';
const REPO_OWNER = 'Minestorm01';
const REPO_NAME = 'Stocktake';

function getPath(staffId, location) {
  return `${staffId}-${location}.csv`.toLowerCase().replace(/\s+/g, '-');
}

export async function loadCsvFromGitHub(staffId, location) {
  const path = getPath(staffId, location);
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    if (!res.ok) throw new Error('File not found');

    const data = await res.json();
    return decodeURIComponent(escape(atob(data.content)));
  } catch (err) {
    console.warn(`❌ No saved CSV for ${staffId}/${location}`);
    return null;
  }
}

export async function saveCsvToGitHub(staffId, location, csvData) {
  const path = getPath(staffId, location);
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  const encoded = btoa(unescape(encodeURIComponent(csvData)));

  let sha = null;
  try {
    const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
    const data = await res.json();
    sha = data.sha;
  } catch (e) {}

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Auto-save stocktake',
      content: encoded,
      ...(sha && { sha })
    })
  });

  return res.ok;
}

export async function deleteCsvFromGitHub(staffId, location) {
  const path = getPath(staffId, location);
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await res.json();
    const sha = data.sha;

    const del = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Reset stocktake file',
        sha
      })
    });

    return del.ok;
  } catch (err) {
    console.warn(`⚠️ No file to delete for ${staffId}/${location}`);
    return false;
  }
}
