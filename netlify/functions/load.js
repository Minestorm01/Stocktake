const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const token = process.env.GITHUB_TOKEN || "";
    const { filename } = JSON.parse(event.body);
    const repo = process.env.REPO_NAME || "";
    const owner = process.env.REPO_OWNER || "";

    if (!token || !repo || !owner) {
      console.error("❌ Missing required environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing required environment variables." })
      };
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;

    const res = await fetch(url, {
      headers: { Authorization: `token ${token}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Failed to fetch file from GitHub:", res.status, errorText);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "GitHub fetch failed", details: errorText })
      };
    }

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
      statusCode: 200,
      body: JSON.stringify({ content })
    };
  } catch (err) {
    console.error("❌ Error in load function:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unexpected error", message: err.message })
    };
  }
};
