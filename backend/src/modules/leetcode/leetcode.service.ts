import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Submission } from '../submissions/entities/submission.entity';
import { User } from '../users/entities/user.entity';
import { SubmissionsService } from '../submissions/submissions.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class LeetcodeService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly submissionsService: SubmissionsService,
    private readonly usersService: UsersService,
  ) {}

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

  async syncUser(
    username: string,
    user: User,
  ): Promise<{
    message: string;
    submissionsProcessed: number;
    submissionsAdded: number;
  }> {
    const query = {
      query: `
        query recentSubmissionList($username: String!, $limit: Int) {
          recentSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
      `,
      variables: {
        username,
        limit: 50,
      },
    };

    let response;
    try {
      response = await axios.post(
        'https://leetcode.com/graphql',
        query,
        {
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
          },
        },
      );
    } catch (error) {
      console.error('LEETCODE SYNC API ERROR:', error);
      throw new BadRequestException('Failed to reach LeetCode API');
    }

    const submissions = response.data?.data?.recentSubmissionList ?? [];

    const beforeCount = await this.submissionRepo.count({
      where: { userId: user.id, platform: 'leetcode' },
    });

    const submissionsToSave: Partial<Submission>[] = submissions.map(
      (sub: {
        title: string;
        titleSlug: string;
        timestamp: string;
        statusDisplay: string;
        lang: string;
      }) => {
        return {
          userId: user.id,
          platform: 'leetcode',
          problemId: sub.titleSlug,
          problemName: sub.title,
          verdict: sub.statusDisplay,
          language: sub.lang,
          submittedAt: new Date(parseInt(sub.timestamp, 10) * 1000),
          tags: [],
        };
      },
    );

    await this.submissionsService.saveSubmissions(submissionsToSave);

    const afterCount = await this.submissionRepo.count({
      where: { userId: user.id, platform: 'leetcode' },
    });

    await this.usersService.updateLcLastSynced(user.id);

    return {
      message: 'LeetCode sync completed successfully',
      submissionsProcessed: submissions.length,
      submissionsAdded: afterCount - beforeCount,
    };
  }

  async syncByUserId(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.lcHandle) {
      throw new NotFoundException('LeetCode handle not found');
    }

    return this.syncUser(user.lcHandle, user);
  }
}