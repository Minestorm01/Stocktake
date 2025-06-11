const fetch = require('node-fetch');

exports.handler = async (event) => {
  const filename = event.queryStringParameters.filename;
  const token = process.env.GITHUB_TOKEN;

  const repoOwner = "YOUR_USERNAME";
  const repoName = "YOUR_REPO";
  const url = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filename}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
    }
  });

  if (!res.ok) {
    return {
      statusCode: res.status,
      body: `Error fetching file: ${res.statusText}`
    };
  }

  const data = await res.text();

  return {
    statusCode: 200,
    body: data,
  };
};
