const axios = require('axios');

async function tryQuery(name, queryStr, variables) {
  try {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      { query: queryStr, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
      },
    );
    console.log(`=== Query: ${name} ===`);
    console.log('STATUS:', response.status);
    console.log('DATA:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(`ERROR for ${name}:`, error.message);
  }
}

async function main() {
  const username = 'awice'; // an active user

  const q3 = `
    query recentSubmissionList($username: String!, $limit: Int) {
      recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  await tryQuery('recentSubmissionList for awice', q3, { username, limit: 10 });
}

main();
