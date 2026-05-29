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

      return response.data.data.matchedUser;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch LeetCode data',
      };
    }
  }
}