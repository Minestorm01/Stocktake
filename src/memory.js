// memory.js — Netlify-safe version

export async function loadCsvFromGitHub(filePath) {
  const res = await fetch('/.netlify/functions/load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath })
  });

  if (res.ok) {
    const { content } = await res.json();
    return content;
  } else {
    console.warn(`No file found for ${filePath}`);
    return null;
  }
}

export async function saveCsvToGitHub(filePath, csvData) {
  const res = await fetch('/.netlify/functions/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath, content: csvData })
  });

  return res.ok;
}

export async function deleteCsvFromGitHub(filePath) {
  const res = await fetch('/.netlify/functions/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath })
  });

  return res.ok;
}
