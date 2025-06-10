// memory.js

const SAVE_API = "/.netlify/functions/save";
const LOAD_API = "/.netlify/functions/load";
const DELETE_API = "/.netlify/functions/delete";

export async function loadCsvFromGitHub(filename) {
  try {
    const res = await fetch(LOAD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: filename })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { content } = await res.json();
    return content;
  } catch (err) {
    console.error("❌ Failed to load CSV from memory:", err);
    return null;
  }
}

export async function saveCsvToGitHub(filename, content) {
  try {
    const res = await fetch(SAVE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: filename, content })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`💾 Saved ${filename} to memory.`);
  } catch (err) {
    console.error("❌ Failed to save CSV to memory:", err);
  }
}

export async function deleteCsvFromGitHub(filename) {
  try {
    const res = await fetch(DELETE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: filename })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`🗑️ Deleted ${filename} from memory.`);
  } catch (err) {
    console.error("❌ Failed to delete CSV from memory:", err);
  }
}
