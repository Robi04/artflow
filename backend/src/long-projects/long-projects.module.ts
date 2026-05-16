import { Module } from '@nestjs/common';
import { BadgesModule } from '../badges/badges.module';
import { LongProjectsController } from './long-projects.controller';
import { LongProjectsService } from './long-projects.service';

@Module({
  imports: [BadgesModule],
  controllers: [LongProjectsController],
  providers: [LongProjectsService],
})
export class LongProjectsModule {}
