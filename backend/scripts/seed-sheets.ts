import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import axios from 'axios';

import { Problem } from '../src/modules/problems/entities/problem.entity';
import { ProblemMap } from '../src/modules/sheets/entities/problem-map.entity';
import { SheetProblem } from '../src/modules/sheets/entities/sheet-problem.entity';
import {
  normalizeTags,
  extractProblemId,
} from '../src/common/utils/tag.util';

config({ path: path.join(__dirname, '../.env') });

type SeedProblem = {
  platform: string;
  title: string;
  topic?: string;
  difficulty: string | number;
  url: string;
  problemId?: string;
  tags?: string[];
};

type SeedSheet = {
  sheet: string;
  problems: SeedProblem[];
};

async function seedSheets() {
  const dataPath = path.join(__dirname, '../data/sheets/index.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const sheets = JSON.parse(raw) as SeedSheet[];

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Problem, ProblemMap, SheetProblem],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connection initialized for seeding.');

  console.log('Clearing old SheetProblems with CASCADE...');
  await dataSource.query('TRUNCATE TABLE "sheet_problem" CASCADE');
  
  const sheetProblemRepo = dataSource.getRepository(SheetProblem);

  // A2Z Seed (Only using real data from JSON)
  console.log('Seeding A2Z problems from local JSON...');
  const a2zJsonSheet = sheets.find((s) => s.sheet === 'A2Z');
  const a2zBaseProblems = a2zJsonSheet ? a2zJsonSheet.problems : [];

  const a2zProblemsToInsert: Partial<SheetProblem>[] = [];

  for (let i = 0; i < a2zBaseProblems.length; i++) {
    const item = a2zBaseProblems[i];
    const platform = item.platform.toLowerCase();
    const problemId =
      item.problemId ||
      extractProblemId(platform, item.url, item.title) ||
      `a2z-p${i + 1}`;

    a2zProblemsToInsert.push({
      sheetName: 'A2Z',
      problemNumber: i + 1,
      orderIndex: i + 1,
      problemId,
      title: item.title,
      platform,
      topic: item.topic || 'General',
      difficulty: String(item.difficulty || 'Medium'),
      tags: normalizeTags([
        ...(item.tags ?? []),
        ...(item.topic ? [item.topic] : []),
      ]),
      sourceUrl: item.url,
    });
  }

  // TLE31 Seed (Fetching real Codeforces problems by rating)
  console.log('Seeding TLE31 problems from Codeforces API...');
  const tle31ProblemsToInsert: Partial<SheetProblem>[] = [];
  
  try {
    const cfResponse = await axios.get('https://codeforces.com/api/problemset.problems');
    if (cfResponse.data.status === 'OK') {
      const allProblems = cfResponse.data.result.problems;
      const ratings = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
      
      let problemCount = 1;
      for (const rating of ratings) {
        // Get up to 31 problems for each rating bucket
        const bucketProblems = allProblems.filter((p: any) => p.rating === rating).slice(0, 31);
        for (let i = 0; i < bucketProblems.length; i++) {
          const cp = bucketProblems[i];
          const problemId = `${cp.contestId}-${cp.index}`;
          tle31ProblemsToInsert.push({
            sheetName: 'TLE31',
            problemNumber: problemCount,
            orderIndex: problemCount,
            ratingBucket: String(rating),
            problemId,
            title: cp.name,
            platform: 'codeforces',
            difficulty: rating < 1200 ? 'Easy' : rating < 1600 ? 'Medium' : 'Hard',
            tags: cp.tags || [],
            sourceUrl: `https://codeforces.com/problemset/problem/${cp.contestId}/${cp.index}`
          });
          problemCount++;
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch from CF API. Falling back to empty TLE31 seed.");
  }

  // Bulk insert
  const allProblems = [...a2zProblemsToInsert, ...tle31ProblemsToInsert];
  // Insert in chunks to avoid query limits
  const chunkSize = 100;
  for (let i = 0; i < allProblems.length; i += chunkSize) {
    await sheetProblemRepo.save(allProblems.slice(i, i + chunkSize));
  }

  console.log(
    `Seed complete: Seeded ${a2zProblemsToInsert.length} A2Z problems and ${tle31ProblemsToInsert.length} TLE31 problems successfully into SheetProblem!`,
  );

  await dataSource.destroy();
}

seedSheets().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
