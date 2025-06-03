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

    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const content = decodeURIComponent(escape(Buffer.from(data.content, 'base64').toString()));

    return {
      statusCode: 200,
      body: JSON.stringify({ content })
    };
  } catch (err) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'File not found' })
    };
  }
};
