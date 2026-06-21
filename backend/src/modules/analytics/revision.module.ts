import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RevisionService } from './revision.service';
import { RevisionController } from './revision.controller';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { UnifiedModule } from '../unified/unified.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Problem]),
    UnifiedModule,
  ],
  controllers: [RevisionController],
  providers: [RevisionService],
  exports: [RevisionService],
})
export class RevisionModule {}
