const fetch = require('node-fetch');

exports.handler = async (event) => {
  const token = process.env.GITHUB_TOKEN || "";
  const { filename, content } = JSON.parse(event.body);
  const repo = process.env.REPO_NAME || "";
  const owner = process.env.REPO_OWNER || "";

  if (!token || !repo || !owner) {
    console.log("ℹ️ GitHub env vars not set - save disabled");
    return {
      statusCode: 200,
      body: JSON.stringify({ disabled: true })
    };
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;

  let sha;
  try {
    const existing = await fetch(url, {
      headers: { Authorization: `token ${token}` }
    });
    if (existing.ok) {
      const json = await existing.json();
      sha = json.sha;
    }
  } catch (err) {
    console.error("⚠️ Could not check if file exists:", err.message);
  }

  const bodyPayload = {
    message: 'Auto-save stocktake',
    content: Buffer.from(content).toString('base64'),
    ...(sha && { sha })
  };

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    const responseBody = await res.text();

    if (!res.ok) {
      console.error("❌ GitHub API save failed:", res.status, responseBody);
      return {
        statusCode: res.status,
        body: responseBody
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, filename })
    };
  } catch (err) {
    console.error("❌ Unexpected error saving file:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unexpected server error: " + err.message })
    };
  }
};
