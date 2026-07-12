import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Submission } from '../submissions/entities/submission.entity';
import { Contest } from '../contests/entities/contest.entity';
import { normalizeTag } from '../../common/utils/tag.util';
import { isAcceptedVerdict } from '../../common/utils/submission-problem.util';

@Injectable()
export class ContestAnalysisService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepo: Repository<Submission>,
    @InjectRepository(Contest)
    private contestRepo: Repository<Contest>,
  ) {}

  async getContestAnalysis(userId: number) {
    const contests = await this.contestRepo.find({ where: { userId }, order: { contestId: 'DESC' } });
    const submissions = await this.submissionsRepo.find({ where: { userId, platform: 'codeforces' } });

    const contestReports: any[] = [];
    const insights: string[] = [];
    
    let totalTimeWasted = 0;
    let totalImplementationFails = 0;
    let totalGreedyFails = 0;
    let totalMathFails = 0;
    let totalDPFails = 0;
    
    let ratingGained = 0;
    let ratingLost = 0;

    for (const contest of contests) {
      const contestSubs = submissions.filter(s => s.problemId.startsWith(`${contest.contestId}-`));
      
      const solved = new Set<string>();
      const attempted = new Set<string>();
      let wrongAttempts = 0;
      let penalty = 0;
      let timeSpent = 0;
      let hardestSolvedDiff = 0;
      let easiestMissedDiff = 9999;
      
      contestSubs.forEach(sub => {
        attempted.add(sub.problemId);
        
        if (isAcceptedVerdict(sub.verdict)) {
          solved.add(sub.problemId);
          if (sub.rating && sub.rating > hardestSolvedDiff) {
            hardestSolvedDiff = sub.rating;
          }
        } else {
          wrongAttempts++;
          penalty += 50; // Standard 50 min penalty
          
          const tags = sub.tags?.map(normalizeTag) ?? [];
          if (tags.includes('implementation')) totalImplementationFails++;
          if (tags.includes('greedy')) totalGreedyFails++;
          if (tags.includes('math')) totalMathFails++;
          if (tags.includes('dp')) totalDPFails++;
        }
      });
      
      // Calculate Easiest Missed
      const uniqueSubs = Array.from(attempted).map(id => contestSubs.find(s => s.problemId === id));
      uniqueSubs.forEach(sub => {
        if (sub && !solved.has(sub.problemId) && sub.rating && sub.rating < easiestMissedDiff) {
          easiestMissedDiff = sub.rating;
        }
      });
      
      const accuracy = attempted.size > 0 ? (solved.size / attempted.size) * 100 : 0;
      
      const ratingChange = (contest.newRating ?? 0) - (contest.oldRating ?? 0);
      if (ratingChange > 0) ratingGained += ratingChange;
      else ratingLost += Math.abs(ratingChange);

      contestReports.push({
        contestId: contest.contestId,
        contestName: contest.contestName,
        ratingChange,
        newRating: contest.newRating,
        solved: solved.size,
        attempted: attempted.size,
        wrongAttempts,
        penalty,
        accuracy,
        hardestSolved: hardestSolvedDiff > 0 ? hardestSolvedDiff : null,
        easiestMissed: easiestMissedDiff < 9999 ? easiestMissedDiff : null,
      });
    }

    // Generate Intelligent Insights
    if (totalImplementationFails > 5) insights.push('You repeatedly fail implementation problems.');
    if (totalGreedyFails > totalDPFails && totalGreedyFails > 3) insights.push('You struggle with greedy logic more than dynamic programming.');
    if (ratingLost > ratingGained) insights.push('You are losing more rating than gaining. Focus on consistency over speed.');
    if (contestReports.some(c => c.wrongAttempts > 3 && c.solved <= 1)) insights.push('You panic when the first few submissions fail.');
    if (insights.length === 0) insights.push('Keep practicing! Need more contest data to generate deep insights.');

    return {
      reports: contestReports,
      insights,
      summary: {
        totalContests: contests.length,
        averageSolved: contests.length > 0 ? Math.round((contestReports.reduce((sum, r) => sum + r.solved, 0) / contests.length) * 10) / 10 : 0,
        averageAccuracy: contests.length > 0 ? Math.round(contestReports.reduce((sum, r) => sum + r.accuracy, 0) / contests.length) : 0
      }
    };
  }
}
