const fetch = require('node-fetch');

exports.handler = async (event) => {
  const token = process.env.GITHUB_TOKEN;
  const { filePath } = JSON.parse(event.body);
  const repo = process.env.REPO_NAME;
  const owner = process.env.REPO_OWNER;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `token ${token}` }
    });
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

    return {
      statusCode: del.ok ? 200 : 500,
      body: JSON.stringify({ ok: del.ok })
    };
  } catch (err) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'File not found' })
    };
  }
};
