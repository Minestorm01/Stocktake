// memory.js

const API_BASE = "/.netlify/functions/save";

export async function loadCsvFromGitHub(filename) {
  try {
    const res = await fetch(`${API_BASE}?filename=${filename}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.text();
    return data;
  } catch (err) {
    console.error("❌ Failed to load CSV from memory:", err);
    return null;
  }
}

export async function saveCsvToGitHub(filename, content) {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`💾 Saved ${filename} to memory.`);
  } catch (err) {
    console.error("❌ Failed to save CSV to memory:", err);
  }
}

export async function deleteCsvFromGitHub(filename) {
  try {
    const res = await fetch(API_BASE, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`🗑️ Deleted ${filename} from memory.`);
  } catch (err) {
    console.error("❌ Failed to delete CSV from memory:", err);
  }
}
