import { Problem } from '../../modules/problems/entities/problem.entity';
import { Submission } from '../../modules/submissions/entities/submission.entity';

export type SubmissionWithProblem = Submission & {
  problemTags: string[];
  problemDifficulty: number | null;
  problemTitle: string | null;
};

export function buildProblemLookup(
  problems: Problem[],
): Map<string, Problem> {
  const map = new Map<string, Problem>();

  for (const problem of problems) {
    map.set(`${problem.platform}:${problem.problemId}`, problem);
  }

  return map;
}

export function attachProblemsToSubmissions(
  submissions: Submission[],
  problemMap: Map<string, Problem>,
): SubmissionWithProblem[] {
  return submissions.map((submission) => {
    const problem = problemMap.get(
      `${submission.platform}:${submission.problemId}`,
    );

    return {
      ...submission,
      problemTags: problem?.tags ?? submission.tags ?? [],
      problemDifficulty: problem?.difficulty ?? submission.rating ?? null,
      problemTitle: problem?.title ?? submission.problemName ?? null,
    };
  });
}

export function getSubmissionTags(
  submission: SubmissionWithProblem,
): string[] {
  const tags = submission.problemTags?.length
    ? submission.problemTags
    : submission.tags ?? [];

  return tags.filter(Boolean);
}

export function isAcceptedVerdict(verdict: string): boolean {
  return verdict === 'OK' || verdict === 'Accepted';
}
