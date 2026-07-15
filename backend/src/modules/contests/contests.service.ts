import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ContestsService {
  async getUpcomingCodeforcesContests() {
    const response = await axios.get('https://codeforces.com/api/contest.list');

    const contests = response.data.result;

    return contests
      .filter((contest) => contest.phase === 'BEFORE')
      .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
      .map((contest) => ({
        id: contest.id,
        platform: 'Codeforces',
        name: contest.name,
        startTime: new Date(contest.startTimeSeconds * 1000),
        durationHours: contest.durationSeconds / 3600,

        url: `https://codeforces.com/contests/${contest.id}`,
      }));
  }

  async getUpcomingLeetCodeContests() {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: `
          query {
            allContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
      },
    );

    const contests = response.data.data.allContests;

    const now = Date.now() / 1000;

    return contests
      .filter((contest) => contest.startTime > now)
      .map((contest) => ({
        id: contest.titleSlug,
        platform: 'LeetCode',
        name: contest.title,
        startTime: new Date(contest.startTime * 1000),
        durationHours: contest.duration / 3600,
        url: `https://leetcode.com/contest/${contest.titleSlug}`,
      }));
  }

  async getUpcomingCodechefContests() {
    try {
      const url = 'https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all';
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.codechef.com/contests',
        },
      });

      const contests = response.data.future_contests ?? [];

      return contests.map((contest) => ({
        id: contest.contest_code,
        platform: 'CodeChef',
        name: contest.contest_name,
        startTime: new Date(contest.contest_start_date_iso),
        durationHours: parseFloat(contest.contest_duration) / 60,
        url: `https://www.codechef.com/${contest.contest_code}`,
      }));
    } catch (error) {
      console.error('FAILED TO FETCH CODECHEF CONTESTS:', error.message);
      return [];
    }
  }

  async getUpcomingContests() {
    const codeforces = await this.getUpcomingCodeforcesContests();
    const leetcode = await this.getUpcomingLeetCodeContests();
    const codechef = await this.getUpcomingCodechefContests();

    return [...codeforces, ...leetcode, ...codechef].sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime(),
    );
  }
}
