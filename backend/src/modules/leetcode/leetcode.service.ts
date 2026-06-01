import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LeetcodeService {
  async getUserData(username: string) {
    const query = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              ranking
              reputation
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: {
        username,
      },
    };

    try {
      const response = await axios.post(
        'https://leetcode.com/graphql',
        query,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const user = response.data.data.matchedUser;

return {
  user: {
    username: user.username,
    ranking: user.profile?.ranking,
    reputation: user.profile?.reputation,

    easySolved:
      user.submitStats?.acSubmissionNum?.find(
        (x) => x.difficulty === 'Easy'
      )?.count || 0,

    mediumSolved:
      user.submitStats?.acSubmissionNum?.find(
        (x) => x.difficulty === 'Medium'
      )?.count || 0,

    hardSolved:
      user.submitStats?.acSubmissionNum?.find(
        (x) => x.difficulty === 'Hard'
      )?.count || 0,
  },

  ratings: [],

  submissions: [],
};
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch LeetCode data',
      };
    }
  }
}