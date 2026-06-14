import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CodeforcesService {
  async getUserData(handle: string) {
    try {
      // Fetch user profile info
      const userInfo = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handle}`,
      );

      // Fetch rating history
      const ratingHistory = await axios.get(
        `https://codeforces.com/api/user.rating?handle=${handle}`,
      );

      // Fetch submissions
      const submissions = await axios.get(
        `https://codeforces.com/api/user.status?handle=${handle}`,
      );

      const rawUser = userInfo.data.result[0];
      const rawRatings = ratingHistory.data.result || [];
      const rawSubmissions = submissions.data.result || [];

      return {
        success: true,
        user: {
          cfHandle: rawUser.handle,
          cfCurrentRating: rawUser.rating ?? 0,
          cfMaxRating: rawUser.maxRating ?? 0,
          cfRank: rawUser.rank ?? 'Unrated',
          avatar: rawUser.titlePhoto || rawUser.avatar,
        },
        ratingHistory: rawRatings.map((r: any) => ({
          contestName: r.contestName,
          ratingAfter: r.newRating,
          ratingBefore: r.oldRating,
          rank: r.rank,
          updateTime: r.ratingUpdateTimeSeconds
            ? new Date(r.ratingUpdateTimeSeconds * 1000).toISOString()
            : null,
        })),
        submissions: rawSubmissions.slice(0, 20).map((s: any) => ({
          time: s.creationTimeSeconds
            ? new Date(s.creationTimeSeconds * 1000).toLocaleString()
            : '-',
          problemName: s.problem?.name || 'Unknown Problem',
          verdict: s.verdict || 'UNKNOWN',
          language: s.programmingLanguage || '-',
        })),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: 'Failed to fetch Codeforces data',
        error: message,
        user: null,
        ratingHistory: [],
        submissions: [],
      };
    }
  }
}