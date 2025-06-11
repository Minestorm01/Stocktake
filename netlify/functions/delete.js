const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const token = process.env.GITHUB_TOKEN || "";
    const { filename } = JSON.parse(event.body);
    const repo = process.env.REPO_NAME || "";
    const owner = process.env.REPO_OWNER || "";

    if (!token || !repo || !owner) {
      console.log("ℹ️ GitHub env vars not set - delete disabled");
      return {
        statusCode: 200,
        body: JSON.stringify({ disabled: true })
      };
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;

    const res = await fetch(url, {
      headers: { Authorization: `token ${token}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Failed to locate file before delete:", res.status, errorText);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "File not found or access denied", details: errorText })
      };
    }

    const data = await res.json();
    const sha = data.sha;

    const del = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Deleted by Netlify Function',
        sha
      })
    });

    const resultText = await del.text();

    if (!del.ok) {
      console.error("❌ GitHub delete failed:", del.status, resultText);
      return {
        statusCode: del.status,
        body: JSON.stringify({ error: "GitHub delete failed", details: resultText })
      };
    }

    console.log(`✅ Successfully deleted: ${filename}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, filename })
    };
  } catch (err) {
    console.error("❌ Error in delete function:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unexpected error", message: err.message })
    };
  }
};
