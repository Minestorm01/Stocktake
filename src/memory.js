const API_BASE = "/.netlify/functions/save";

export async function loadCsvFromGitHub(filename) {
  try {
    const res = await fetch(\`\${API_BASE}?filename=\${filename}\`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Failed to load CSV from memory:", res.status, errorText);
      throw new Error(\`Failed to load \${filename}\`);
    }
    const data = await res.text();
    console.log(`📥 Loaded \${filename} from GitHub`);
    return data;
  } catch (err) {
    console.error("❌ Error loading CSV:", err);
    alert("❌ Could not load the file: " + err.message);
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
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Save failed:", res.status, errorText);
      alert("❌ Save failed: " + errorText);
      return;
    }
    console.log(`💾 Saved \${filename} to memory.`);
    alert("✅ File saved successfully as: " + filename);
  } catch (err) {
    console.error("❌ Failed to save CSV to memory:", err);
    alert("❌ Error saving file: " + err.message);
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
    console.log(`🗑️ Deleted \${filename} from memory.`);
    alert("🗑️ File deleted: " + filename);
  } catch (err) {
    console.error("❌ Failed to delete CSV from memory:", err);
    alert("❌ Could not delete file: " + err.message);
  }
}
