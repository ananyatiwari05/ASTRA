import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CodeforcesService {
  async getUserData(handle: string) {
    try {
      // Fetch user profile info
      const userInfo = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handle}`
      );

      // Fetch rating history
      const ratingHistory = await axios.get(
        `https://codeforces.com/api/user.rating?handle=${handle}`
      );

      // Fetch submissions
      const submissions = await axios.get(
        `https://codeforces.com/api/user.status?handle=${handle}`
      );

      // Return combined data
      return {
        success: true,
        user: userInfo.data.result[0],
        ratings: ratingHistory.data.result,
        submissions: submissions.data.result.slice(0, 20),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch Codeforces data',
        error: error.message,
      };
    }
  }
}