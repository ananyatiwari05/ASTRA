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

interface A2ZProblem {
  id: string;
  qnTitle: string;
  gfg: string | null;
  leetcode: string | null;
  difficulty?: string;
  estimatedTime?: number;
  prerequisites?: string[];
  isOptional?: boolean;
}

type A2ZJson = Record<string, Record<string, A2ZProblem[]>>;

async function seedSheets() {
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

  // A2Z Seed
  console.log('Seeding A2Z problems from local JSON...');
  const a2zDataPath = path.join(__dirname, '../data/sheets/a2z.json');
  let a2zJson: A2ZJson = {};
  try {
    const rawContent = fs.readFileSync(a2zDataPath, 'utf-8');
    try {
      a2zJson = JSON.parse(rawContent);
    } catch (e) {
      // Use VM to safely evaluate loosely formatted JS object (e.g. unquoted keys, single quotes)
      const vm = require('vm');
      const sandbox = { result: {} };
      vm.createContext(sandbox);
      // Try with and without curly braces
      try {
        vm.runInContext(`result = (${rawContent})`, sandbox);
      } catch (e2) {
        vm.runInContext(`result = ({${rawContent}})`, sandbox);
      }
      a2zJson = sandbox.result;
    }
    console.log(`Parsed A2Z topics: ${Object.keys(a2zJson).length}`);
  } catch (e) {
    console.log('Failed to parse a2z.json format, skipping A2Z seed. Error:', e.message);
  }

  const a2zProblemsToInsert: Partial<SheetProblem>[] = [];
  let a2zCount = 1;

  for (const [topic, subTopics] of Object.entries(a2zJson)) {
    for (const [subTopic, problems] of Object.entries(subTopics)) {
      for (const item of problems) {
        // Determine platform and URL
        let platform = 'unknown';
        let url = '';
        if (item.leetcode) {
          platform = 'leetcode';
          url = item.leetcode;
        } else if (item.gfg) {
          platform = 'geeksforgeeks';
          url = item.gfg;
        }

        const problemId = extractProblemId(platform, url, item.qnTitle) || `a2z-p${a2zCount}`;

        a2zProblemsToInsert.push({
          sheetName: 'A2Z',
          problemNumber: a2zCount,
          orderIndex: a2zCount,
          problemId,
          title: item.qnTitle,
          platform,
          topic,
          subTopic,
          difficulty: item.difficulty || 'Medium',
          tags: normalizeTags([topic, subTopic]),
          sourceUrl: url,
          estimatedTime: item.estimatedTime || 30, // Default 30 mins
          prerequisites: item.prerequisites || [],
          isOptional: item.isOptional || false,
        });
        a2zCount++;
      }
    }
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
