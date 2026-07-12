import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Submission } from '../submissions/entities/submission.entity';
import { Contest } from '../contests/entities/contest.entity';
import { SheetProblem } from '../sheets/entities/sheet-problem.entity';
import { UnifiedSolveService } from '../unified/unified-solve.service';
import { AnalyticsService } from './analytics.service';
import { normalizeTag } from '../../common/utils/tag.util';
import { isAcceptedVerdict } from '../../common/utils/submission-problem.util';

@Injectable()
export class UpsolvingService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepo: Repository<Submission>,
    @InjectRepository(Contest)
    private contestRepo: Repository<Contest>,
    @InjectRepository(SheetProblem)
    private sheetProblemRepo: Repository<SheetProblem>,
    private readonly unifiedSolveService: UnifiedSolveService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getUpsolvingQueue(userId: number, limit = 15) {
    const [
      weaknesses,
      contests,
      submissions,
      solvedProblems,
    ] = await Promise.all([
      this.analyticsService.getDetailedWeaknesses(userId),
      this.contestRepo.find({ where: { userId }, order: { contestId: 'DESC' }, take: 10 }),
      this.submissionsRepo.find({ where: { userId, platform: 'codeforces' } }),
      this.unifiedSolveService.getUnifiedSolvedProblems(userId),
    ]);

    const solvedSet = new Set(solvedProblems.map(p => `${p.platform}:${p.problemId}`));
    const queue: any[] = [];
    
    const weaknessMap = new Map(weaknesses.map(w => [w.topic, w.weaknessScore]));

    // 1. Add Missed Contest Problems
    const recentContestIds = new Set(contests.map(c => c.contestId));
    
    // Group contest submissions by problem
    const contestSubs = submissions.filter(s => {
      const match = s.problemId.match(/^(\d+)-/);
      return match && recentContestIds.has(Number(match[1]));
    });

    const missedContestProblems = new Map<string, any>();
    
    for (const sub of contestSubs) {
      if (!solvedSet.has(`codeforces:${sub.problemId}`)) {
        missedContestProblems.set(sub.problemId, sub);
      }
    }

    for (const [problemId, sub] of missedContestProblems.entries()) {
      const tags = sub.tags?.map(normalizeTag) ?? ['general'];
      const maxWeakness = Math.max(...tags.map(t => weaknessMap.get(t) ?? 0));
      
      const priorityScore = 150 + (maxWeakness * 0.5) - (sub.difficulty ? Math.max(0, sub.difficulty - 1500) * 0.05 : 0);
      
      queue.push({
        problemId,
        title: sub.title || `Problem ${problemId}`,
        platform: 'codeforces',
        difficulty: sub.difficulty,
        tags: sub.tags,
        sourceUrl: `https://codeforces.com/contest/${problemId.split('-')[0]}/problem/${problemId.split('-')[1]}`,
        reason: 'Missed in recent contest',
        priorityScore,
        type: 'Contest Miss'
      });
    }

    // 2. Add High ROI Sheet Problems (from Weak Topics)
    for (const weakTopic of weaknesses.slice(0, 5)) {
      if (weakTopic.weaknessScore < 40) continue;
      
      for (const p of weakTopic.suggestedProblems) {
        if (!queue.find(q => q.problemId === p.problemId)) {
          queue.push({
            problemId: p.problemId,
            title: p.title,
            platform: p.platform,
            difficulty: p.difficulty,
            tags: [weakTopic.topic],
            sourceUrl: p.url,
            reason: `High ROI: Improve ${weakTopic.topic}`,
            priorityScore: 100 + (weakTopic.weaknessScore * 0.5),
            type: 'Weakness Drill'
          });
        }
      }
    }

    return queue.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, limit);
  }
}
