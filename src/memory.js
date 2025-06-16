import Papa from 'papaparse';

const SAVE_API = "/.netlify/functions/save";
const LOAD_API = "/.netlify/functions/load";
const DELETE_API = "/.netlify/functions/delete";
const LOCAL_PREFIX = "stocktake_";

// GitHub environment variables injected at build time
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH;

// Determine if GitHub integration should be active
const githubEnabled = !!(
  GITHUB_TOKEN &&
  GITHUB_REPO &&
  GITHUB_USERNAME &&
  GITHUB_BRANCH
);

if (!githubEnabled) {
  console.log("⚠️ GitHub integration disabled due to missing env vars:", {
    GITHUB_TOKEN: GITHUB_TOKEN ? "✅" : "❌",
    GITHUB_REPO,
    GITHUB_USERNAME,
    GITHUB_BRANCH,
  });
}

function loadCsvLocally(filename) {
  const data = localStorage.getItem(LOCAL_PREFIX + filename);
  if (data) {
    console.log(`📂 Loaded ${filename} from localStorage`);
  }
  return data;
}

function saveCsvLocally(filename, content) {
  try {
    localStorage.setItem(LOCAL_PREFIX + filename, content);
    console.log(`💾 Saved ${filename} to localStorage`);
  } catch (err) {
    console.error("❌ Failed to save locally:", err);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
    console.log(`⬇️ Downloaded ${filename} as fallback`);
  }
}

function deleteCsvLocally(filename) {
  localStorage.removeItem(LOCAL_PREFIX + filename);
  console.log(`🗑️ Deleted ${filename} from localStorage`);
}

export async function loadCsvFromGitHub(filename, silent = false) {
  if (!filename) return null;
  console.log(`↩️ Attempting to load ${filename} from GitHub`);
  try {
    const res = await fetch(LOAD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
    if (!res.ok) throw new Error(await res.text());
    const { content, disabled } = await res.json();
    if (disabled) {
      const local = loadCsvLocally(filename);
      return local;
    }
    console.log(`📥 Loaded ${filename} from GitHub`);
    return content;
  } catch (err) {
    console.warn("⚠️ GitHub load failed, falling back to localStorage:", err.message);
    const local = loadCsvLocally(filename);
    if (local) return local;
    if (!silent) alert("❌ Could not load the file: " + err.message);
    return null;
  }
}

export async function saveCsvToGitHub(filename, content, silent = false) {
  console.log(`💾 Attempting to save ${filename} to GitHub`);
  try {
    const res = await fetch(SAVE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content })
    });
    if (!res.ok) throw new Error(await res.text());
    const { disabled } = await res.json();
    if (disabled) {
      saveCsvLocally(filename, content);
      if (!silent) alert("Saved locally (GitHub disabled)");
      return;
    }
    console.log(`💾 Saved ${filename} to memory.`);
    if (!silent) alert("✅ File saved successfully as: " + filename);
  } catch (err) {
    console.warn("⚠️ GitHub save failed, saving locally:", err.message);
    saveCsvLocally(filename, content);
    if (!silent) alert("Saved locally due to error: " + err.message);
  }
}

export async function deleteCsvFromGitHub(filename, silent = false) {
  console.log(`🗑️ Attempting to delete ${filename} from GitHub`);
  try {
    const res = await fetch(DELETE_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
    if (!res.ok) throw new Error(await res.text());
    const { disabled } = await res.json();
    if (disabled) {
      deleteCsvLocally(filename);
      if (!silent) alert("Deleted locally (GitHub disabled)");
      return;
    }
    console.log(`🗑️ Deleted ${filename} from memory.`);
    if (!silent) alert("🗑️ File deleted: " + filename);
  } catch (err) {
    console.warn("⚠️ GitHub delete failed, removing locally:", err.message);
    deleteCsvLocally(filename);
    if (!silent) alert("Deleted locally due to error: " + err.message);
  }
}

export function parseVarianceCsv(text) {
  const parsed = Papa.parse(text, { header: true });
  const rows = [];

  parsed.data.forEach((row) => {
    const sku = row['SKU'] || row['Item'] || row['ITEM'] || row['Sku'];
    if (!sku) return;
    const description = row['Description'] || row['DESCRIPTION'] || '';
    const soh = parseInt(row['SOH'] || row['BOOK UNITS'] || 0, 10) || 0;
    const locField = row['Locations Scanned'] || row['Locations'] || row['LOCATION'] || '';
    const locations = [];
    if (locField && locField.trim()) {
      const parts = locField.split(',');
      parts.forEach((p) => {
        const clean = p.trim().replace(/^"|"$/g, '');
        if (!clean) return;
        const match = clean.match(/(\d+)x\s*(.+)/i);
        if (match) {
          const count = parseInt(match[1], 10) || 1;
          const loc = match[2].trim();
          for (let i = 0; i < count; i++) locations.push(loc);
        } else {
          locations.push(clean);
        }
      });
    }
    rows.push({ SKU: sku, Description: description, SOH: soh, locations });
  });

  const baseRows = rows.map((r) => ({ SKU: r.SKU, Description: r.Description, SOH: r.SOH }));
  const scannedRows = [];
  rows.forEach((r) => {
    r.locations.forEach((loc) => {
      scannedRows.push({
        SKU: r.SKU,
        Description: r.Description,
        SOH: 0,
        LOCATION: loc,
        'SCANNED/TYPED': 'S',
      });
    });
  });

  const columns = ['SKU', 'Description', 'SOH'];
  if (scannedRows.length) {
    if (!columns.includes('LOCATION')) columns.push('LOCATION');
    if (!columns.includes('SCANNED/TYPED')) columns.push('SCANNED/TYPED');
  }

  return Papa.unparse([...baseRows, ...scannedRows], { columns });
}
