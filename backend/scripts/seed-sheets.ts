import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

import { Problem } from '../src/modules/problems/entities/problem.entity';
import { ProblemMap } from '../src/modules/sheets/entities/problem-map.entity';
import {
  normalizeTag,
  normalizeTags,
  difficultyToNumber,
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
  const dataPath = path.join(
    __dirname,
    '../data/sheets/index.json',
  );

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const sheets = JSON.parse(raw) as SeedSheet[];

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Problem, ProblemMap],
    synchronize: true,
  });

  await dataSource.initialize();

  const problemRepo = dataSource.getRepository(Problem);
  const problemMapRepo = dataSource.getRepository(ProblemMap);
  const merged = new Map<string, Partial<Problem>>();

  for (const sheet of sheets) {
    for (const item of sheet.problems) {
      const platform = item.platform.toLowerCase();
      const problemId =
        item.problemId ??
        extractProblemId(platform, item.url, item.title);

      const key = `${platform}:${problemId}`;
      const tags = normalizeTags([
        ...(item.tags ?? []),
        ...(item.topic ? [item.topic] : []),
      ]);

      const existing = merged.get(key);

      if (existing) {
        existing.sheet = [
          ...new Set([...(existing.sheet ?? []), sheet.sheet]),
        ];
        existing.tags = normalizeTags([
          ...(existing.tags ?? []),
          ...tags,
        ]);
        continue;
      }

      merged.set(key, {
        platform,
        problemId,
        title: item.title,
        difficulty: difficultyToNumber(item.difficulty),
        tags,
        sheet: [sheet.sheet],
        url: item.url,
      });
    }
  }

  let created = 0;
  let updated = 0;

  for (const entry of merged.values()) {
    const existing = await problemRepo.findOne({
      where: {
        platform: entry.platform!,
        problemId: entry.problemId!,
      },
    });

    if (existing) {
      existing.sheet = [
        ...new Set([
          ...(existing.sheet ?? []),
          ...(entry.sheet ?? []),
        ]),
      ];
      existing.tags = normalizeTags([
        ...(existing.tags ?? []),
        ...(entry.tags ?? []),
      ]);
      existing.title = entry.title ?? existing.title;
      existing.difficulty =
        entry.difficulty ?? existing.difficulty;
      existing.url = entry.url ?? existing.url;
      await problemRepo.save(existing);
      updated++;
      continue;
    }

    await problemRepo.save(entry);
    created++;
  }

  for (const sheet of sheets) {
    for (let index = 0; index < sheet.problems.length; index++) {
      const item = sheet.problems[index];
      const platform = item.platform.toLowerCase();
      const problemId =
        item.problemId ??
        extractProblemId(platform, item.url, item.title);
      const tags = normalizeTags([
        ...(item.tags ?? []),
        ...(item.topic ? [item.topic] : []),
      ]);

      await problemMapRepo.upsert(
        {
          sheetProblemId: String(index + 1),
          platform,
          platformProblemId: problemId,
          title: item.title,
          difficulty: difficultyToNumber(item.difficulty),
          tags,
          sheetName: sheet.sheet,
        },
        ['sheetName', 'sheetProblemId'],
      );
    }
  }

  console.log(
    `Seed complete: ${created} created, ${updated} updated, ${merged.size} unique problems`,
  );

  await dataSource.destroy();
}

seedSheets().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
