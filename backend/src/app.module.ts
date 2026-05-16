import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlanModule } from './plan/plan.module';
import { MissionsModule } from './missions/missions.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { SupabaseModule } from './supabase/supabase.module';
import { BadgesModule } from './badges/badges.module';
import { LongProjectsModule } from './long-projects/long-projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PlanModule,
    SupabaseModule,
    BadgesModule,
    MissionsModule,
    SubmissionsModule,
    LongProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
