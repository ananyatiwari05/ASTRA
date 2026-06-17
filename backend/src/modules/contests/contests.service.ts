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

  

  async getUpcomingContests() {
    const codeforces = await this.getUpcomingCodeforcesContests();
    const leetcode = await this.getUpcomingLeetCodeContests();

    return [...codeforces, ...leetcode].sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime(),
    );
  }
}
