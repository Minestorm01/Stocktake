exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? '✅ Present' : '❌ Missing',
      GITHUB_USERNAME: process.env.GITHUB_USERNAME || '❌ Missing',
      GITHUB_REPO: process.env.GITHUB_REPO || '❌ Missing',
      GITHUB_BRANCH: process.env.GITHUB_BRANCH || '❌ Missing',
    }, null, 2),
  };
};
