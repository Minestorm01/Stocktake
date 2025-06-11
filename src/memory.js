const SAVE_API = "/.netlify/functions/save";
const LOAD_API = "/.netlify/functions/load";
const DELETE_API = "/.netlify/functions/delete";

export async function loadCsvFromGitHub(filename, silent = false) {
  if (!filename) return null;
  try {
    const res = await fetch(LOAD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("\u274C Failed to load CSV from memory:", res.status, errorText);
      if (!silent) alert("❌ Could not load the file: " + errorText);
      return null;
    }
    const { content } = await res.json();
    console.log(`📥 Loaded ${filename} from GitHub`);
    return content;
  } catch (err) {
    console.error("❌ Error loading CSV:", err);
    if (!silent) alert("❌ Could not load the file: " + err.message);
    return null;
  }
}

export async function saveCsvToGitHub(filename, content, silent = false) {
  try {
    const res = await fetch(SAVE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content })
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Save failed:", res.status, errorText);
      if (!silent) alert("❌ Save failed: " + errorText);
      return;
    }
    console.log(`💾 Saved ${filename} to memory.`);
    if (!silent) alert("✅ File saved successfully as: " + filename);
  } catch (err) {
    console.error("❌ Failed to save CSV to memory:", err);
    if (!silent) alert("❌ Error saving file: " + err.message);
  }
}

export async function deleteCsvFromGitHub(filename, silent = false) {
  try {
    const res = await fetch(DELETE_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`🗑️ Deleted ${filename} from memory.`);
    if (!silent) alert("🗑️ File deleted: " + filename);
  } catch (err) {
    console.error("❌ Failed to delete CSV from memory:", err);
    if (!silent) alert("❌ Could not delete file: " + err.message);
  }
}
