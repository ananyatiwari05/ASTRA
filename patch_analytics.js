const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/src/modules/analytics/analytics.service.ts');
let code = fs.readFileSync(filePath, 'utf8');

const newMethod = `
  async getDetailedWeaknesses(userId: number) {
    const [
      topicBreakdown,
      submissions,
      contests,
      sheetProblems,
      sheetProgress,
      solvedProblems,
    ] = await Promise.all([
      this.unifiedSolveService.getTopicBreakdown(userId),
      this.submissionsRepository.find({ where: { userId, platform: 'codeforces' } }),
      this.contestRepository.find({ where: { userId } }),
      this.sheetProblemRepo.find(),
      this.userSheetProgressRepo.find({ where: { userId } }),
      this.unifiedSolveService.getUnifiedSolvedProblems(userId),
    ]);

    const solvedKeys = new Set(
      solvedProblems.map((p) => \`\${p.platform}:\${p.problemId}\`),
    );

    const contestIds = new Set(contests.map((c) => c.contestId));
    const contestAttemptsMap = new Map<string, number>();
    const contestFailuresMap = new Map<string, number>();
    const repeatedWrongMap = new Map<string, number>();
    const lastAttemptMap = new Map<string, Date>();

    for (const submission of submissions) {
      const isContest = submission.problemId.match(/^(\\d+)-/);
      const isSolved = isAcceptedVerdict(submission.verdict);

      for (const tag of submission.tags ?? []) {
        const topic = normalizeTag(tag);
        if (!topic) continue;

        const currentLast = lastAttemptMap.get(topic);
        if (!currentLast || submission.submittedAt > currentLast) {
          lastAttemptMap.set(topic, submission.submittedAt);
        }

        if (isContest) {
          contestAttemptsMap.set(topic, (contestAttemptsMap.get(topic) ?? 0) + 1);
          if (!isSolved) {
            contestFailuresMap.set(topic, (contestFailuresMap.get(topic) ?? 0) + 1);
          }
        }

        if (!isSolved) {
          repeatedWrongMap.set(topic, (repeatedWrongMap.get(topic) ?? 0) + 1);
        }
      }
    }

    const solvedProblemIds = new Set(
      sheetProgress.filter((p) => p.isSolved).map((p) => p.sheetProblemId),
    );

    const sheetTotalMap = new Map<string, number>();
    const sheetUnsolvedMap = new Map<string, number>();

    for (const problem of sheetProblems) {
      const isSolved = solvedProblemIds.has(problem.id);
      for (const tag of problem.tags ?? []) {
        const topic = normalizeTag(tag);
        if (!topic) continue;

        sheetTotalMap.set(topic, (sheetTotalMap.get(topic) ?? 0) + 1);
        if (!isSolved) {
          sheetUnsolvedMap.set(topic, (sheetUnsolvedMap.get(topic) ?? 0) + 1);
        }
      }
    }

    const now = new Date();

    return topicBreakdown
      .map((topicStat) => {
        const topic = topicStat.topic;
        const successRate = topicStat.successRate;

        const contestAttempts = contestAttemptsMap.get(topic) ?? 0;
        const contestFailures = contestFailuresMap.get(topic) ?? 0;
        const contestFailureRate =
          contestAttempts > 0 ? (contestFailures / contestAttempts) * 100 : 0;

        const sheetTotal = sheetTotalMap.get(topic) ?? 0;
        const sheetUnsolved = sheetUnsolvedMap.get(topic) ?? 0;
        const sheetUnsolvedRate =
          sheetTotal > 0 ? (sheetUnsolved / sheetTotal) * 100 : 0;
          
        const repeatedWrongs = repeatedWrongMap.get(topic) ?? 0;
        
        const lastAttempt = lastAttemptMap.get(topic);
        const daysInactive = lastAttempt ? (now.getTime() - lastAttempt.getTime()) / (1000 * 3600 * 24) : 30;

        // Weakness Engine Formula
        // 40% Low Success Rate
        // 20% Contest Failure Rate
        // 20% Sheet Incompletion Rate
        // 10% Inactivity (capped at 30 days)
        // 10% Repeated Wrongs penalty
        
        const inactivityPenalty = Math.min(daysInactive, 30) / 30 * 100;
        const repeatedWrongPenalty = Math.min(repeatedWrongs, 20) / 20 * 100;

        const weaknessScore =
          Math.round(
            ((100 - successRate) * 0.4 +
              contestFailureRate * 0.2 +
              sheetUnsolvedRate * 0.2 +
              inactivityPenalty * 0.1 +
              repeatedWrongPenalty * 0.1) *
              100,
          ) / 100;

        const reasons: string[] = [];
        if (successRate < 50) reasons.push(\`Low success rate (\${Math.round(successRate)}%)\`);
        if (contestFailures >= 2) reasons.push(\`Failed in \${contestFailures} contest problems\`);
        if (sheetUnsolvedRate > 50) reasons.push(\`\${sheetUnsolved} unsolved sheet problems (\${Math.round(sheetUnsolvedRate)}%)\`);
        if (daysInactive > 14) reasons.push(\`Inactive for \${Math.round(daysInactive)} days\`);
        if (repeatedWrongs > 5) reasons.push(\`\${repeatedWrongs} repeated wrong submissions\`);

        const failedProblems = sheetProblems
          .filter((problem) => {
            const tags = (problem.tags ?? []).map(normalizeTag);
            if (!tags.includes(topic)) return false;
            return !solvedProblemIds.has(problem.id);
          })
          .slice(0, 5)
          .map((problem) => ({
            problemId: problem.problemId,
            title: problem.title,
            platform: problem.platform,
            difficulty: problem.difficulty,
            url: problem.sourceUrl,
          }));

        const suggestedProblems = failedProblems.slice(0, 3);

        return {
          topic,
          weaknessScore,
          reasons,
          failedProblems,
          suggestedProblems,
          successRate,
          solved: topicStat.solved,
          attempted: topicStat.attempted,
          contestFailures,
          sheetUnsolved,
        };
      })
      .sort((a, b) => b.weaknessScore - a.weaknessScore);
  }`;

// Find start and end of getDetailedWeaknesses
const startIdx = code.indexOf('async getDetailedWeaknesses(userId: number) {');
const endIdx = code.indexOf('async getUserWeaknesses(userId: number) {');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newMethod + '\n\n  ' + code.substring(endIdx);
  fs.writeFileSync(filePath, code);
  console.log('Successfully patched getDetailedWeaknesses');
} else {
  console.log('Could not find method boundaries');
}
