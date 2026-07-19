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
        rank: contest.rank,
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
    if (contestReports.length > 2 && contestReports[0].solved > contestReports[1].solved && contestReports[1].solved > contestReports[2].solved) insights.push('Your contest performance is consistently improving.');
    if (contestReports.length > 2 && contestReports[0].accuracy < 50 && contestReports[1].accuracy < 50) insights.push('Your contest accuracy is consistently below 50%. Slow down and verify before submitting.');
    if (insights.length === 0) insights.push('Keep practicing! Need more contest data to generate deep insights.');

    // Contest Comparison (Last vs Previous)
    let comparison: any = null;
    let topicComparison: any[] = [];
    
    if (contestReports.length >= 2) {
      const last = contestReports[0];
      const prev = contestReports[1];
      
      const lastSubs = submissions.filter(s => s.problemId.startsWith(`${last.contestId}-`));
      const prevSubs = submissions.filter(s => s.problemId.startsWith(`${prev.contestId}-`));
      
      const calculateTopicStats = (subs: Submission[]) => {
        const stats = new Map<string, { attempted: number, solved: number }>();
        const seenProblems = new Set<string>();
        
        subs.forEach(s => {
          if (!seenProblems.has(s.problemId)) {
             const tags = s.tags?.map(normalizeTag).filter(Boolean) || ['implementation'];
             const isSolved = isAcceptedVerdict(s.verdict);
             tags.forEach(t => {
               if (!t) return;
               const st = stats.get(t) || { attempted: 0, solved: 0 };
               st.attempted++;
               if (isSolved) st.solved++;
               stats.set(t, st);
             });
             seenProblems.add(s.problemId);
          } else {
             if (isAcceptedVerdict(s.verdict)) {
                const tags = s.tags?.map(normalizeTag).filter(Boolean) || ['implementation'];
                tags.forEach(t => {
                   if (!t) return;
                   const st = stats.get(t) || { attempted: 1, solved: 0 };
                   if (st.solved === 0) st.solved++; // only increment solved once per problem
                   stats.set(t, st);
                });
             }
          }
        });
        return stats;
      };

      const lastTopicStats = calculateTopicStats(lastSubs);
      const prevTopicStats = calculateTopicStats(prevSubs);
      const allTopics = new Set([...lastTopicStats.keys(), ...prevTopicStats.keys()]);
      
      topicComparison = Array.from(allTopics).map(topic => {
        const l = lastTopicStats.get(topic) || { attempted: 0, solved: 0 };
        const p = prevTopicStats.get(topic) || { attempted: 0, solved: 0 };
        return {
          topic,
          lastAttempted: l.attempted,
          prevAttempted: p.attempted,
          lastSolved: l.solved,
          prevSolved: p.solved,
          lastAccuracy: l.attempted > 0 ? Math.round((l.solved / l.attempted) * 100) : 0,
          prevAccuracy: p.attempted > 0 ? Math.round((p.solved / p.attempted) * 100) : 0,
        };
      }).sort((a,b) => Math.abs(b.lastAttempted - b.prevAttempted) - Math.abs(a.lastAttempted - a.prevAttempted));

      comparison = {
        ratingChangeDifference: (last.ratingChange || 0) - (prev.ratingChange || 0),
        accuracyDifference: Math.round((last.accuracy - prev.accuracy) * 10) / 10,
        wrongSubmissionDifference: last.wrongAttempts - prev.wrongAttempts,
        solvedDifference: last.solved - prev.solved,
        averageDifficultyIncrease: ((last.hardestSolved || 0) - (prev.hardestSolved || 0)),
        mostImprovedArea: last.accuracy > prev.accuracy && last.solved >= prev.solved ? 'Accuracy' : (last.hardestSolved > prev.hardestSolved ? 'Difficulty ceiling' : 'Speed'),
        needsImmediateAttention: last.wrongAttempts > prev.wrongAttempts ? 'Reducing penalty/wrong submissions' : (last.accuracy < prev.accuracy ? 'Submission accuracy' : 'Solving more problems'),
        topicComparison
      };
    }

    return {
      reports: contestReports.slice(0, 10), // Last 10 contests
      insights,
      comparison,
      summary: {
        totalContests: contests.length,
        averageSolved: contests.length > 0 ? Math.round((contestReports.reduce((sum, r) => sum + r.solved, 0) / contests.length) * 10) / 10 : 0,
        averageAccuracy: contests.length > 0 ? Math.round(contestReports.reduce((sum, r) => sum + r.accuracy, 0) / contests.length) : 0
      }
    };
  }
}
