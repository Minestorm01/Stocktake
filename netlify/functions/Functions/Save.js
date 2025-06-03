const fetch = require('node-fetch');

exports.handler = async (event) => {
  const token = process.env.GITHUB_TOKEN;
  const { filePath, content } = JSON.parse(event.body);
  const repo = process.env.REPO_NAME;
  const owner = process.env.REPO_OWNER;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  let sha;
  try {
    const existing = await fetch(url, {
      headers: { Authorization: `token ${token}` }
    });
    if (existing.ok) {
      const json = await existing.json();
      sha = json.sha;
    }
  } catch (_) {}

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Auto-save stocktake',
      content: Buffer.from(content).toString('base64'),
      ...(sha && { sha })
    })
  });

  return {
    statusCode: res.ok ? 200 : 500,
    body: JSON.stringify({ ok: res.ok })
  };
};
