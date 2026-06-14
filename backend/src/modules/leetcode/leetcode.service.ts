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
        },
      );
      const user = response.data.data.matchedUser;

      if (!user) {
        return {
          success: false,
          message: 'LeetCode user not found',
          user: null,
          ratingHistory: [],
          submissions: [],
        };
      }

      return {
        success: true,
        user: {
          lcHandle: user.username,
          ranking: user.profile?.ranking ?? 'N/A',
          reputation: user.profile?.reputation ?? 0,

          easySolved:
            user.submitStats?.acSubmissionNum?.find(
              (x) => x.difficulty === 'Easy',
            )?.count || 0,

          mediumSolved:
            user.submitStats?.acSubmissionNum?.find(
              (x) => x.difficulty === 'Medium',
            )?.count || 0,

          hardSolved:
            user.submitStats?.acSubmissionNum?.find(
              (x) => x.difficulty === 'Hard',
            )?.count || 0,
        },

        ratingHistory: [],

        submissions: [],
      };
    } catch (error: any) {
      console.error('LEETCODE ERROR:', error?.response?.data || error);

      return {
        success: false,
        message: 'Failed to fetch LeetCode data',
        user: null,
        ratingHistory: [],
        submissions: [],
      };
    }
  }
}