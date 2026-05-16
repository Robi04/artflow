import { Injectable, OnModuleInit } from '@nestjs/common';
import { BadgeCondition } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const BADGE_SEEDS = [
  { name: 'First Steps', description: 'Submit your first artwork.', condition: BadgeCondition.FIRST_SUBMISSION, xpReward: 50 },
  { name: '4-Week Streak', description: 'Submit every week for 4 consecutive weeks.', condition: BadgeCondition.STREAK_4_WEEKS, xpReward: 150 },
  { name: '8-Week Streak', description: 'Submit every week for 8 consecutive weeks.', condition: BadgeCondition.STREAK_8_WEEKS, xpReward: 300 },
  { name: 'Project Completed', description: 'Complete your first long-term project.', condition: BadgeCondition.LONG_PROJECT_COMPLETED, xpReward: 200 },
  { name: 'Style Found', description: 'Complete a submission on the Find My Style axis.', condition: BadgeCondition.STYLE_DISCOVERED, xpReward: 250 },
  { name: 'Level 5', description: 'Reach level 5 on any axis.', condition: BadgeCondition.LEVEL_5_AXIS, xpReward: 200 },
  { name: 'Level 10', description: 'Reach level 10 on any axis.', condition: BadgeCondition.LEVEL_10_AXIS, xpReward: 500 },
];

@Injectable()
export class BadgesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    for (const seed of BADGE_SEEDS) {
      await this.prisma.badge.upsert({
        where: { condition: seed.condition },
        update: {},
        create: seed,
      });
    }
  }

  async getAll() {
    return this.prisma.badge.findMany({ orderBy: { xpReward: 'asc' } });
  }

  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async checkAndAward(userId: string): Promise<string[]> {
    const [user, userAxes, submissions, longProjects, alreadyEarned] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.userAxis.findMany({ where: { plan: { userId } } }),
      this.prisma.submission.findMany({
        where: { mission: { userAxis: { plan: { userId } } } },
      }),
      this.prisma.longProject.findMany({ where: { userId } }),
      this.prisma.userBadge.findMany({ where: { userId }, select: { badge: { select: { condition: true } } } }),
    ]);

    const earned = new Set(alreadyEarned.map((ub) => ub.badge.condition));

    const conditions: Record<BadgeCondition, boolean> = {
      FIRST_SUBMISSION: submissions.length >= 1,
      STREAK_4_WEEKS: (user?.streakCount ?? 0) >= 4,
      STREAK_8_WEEKS: (user?.streakCount ?? 0) >= 8,
      LONG_PROJECT_COMPLETED: longProjects.some((p) => p.status === 'COMPLETED'),
      STYLE_DISCOVERED: submissions.some((s) =>
        userAxes.find((a) => a.id === (s as any).mission?.userAxisId)?.axisType === 'FIND_MY_STYLE',
      ),
      LEVEL_5_AXIS: userAxes.some((a) => a.level >= 5),
      LEVEL_10_AXIS: userAxes.some((a) => a.level >= 10),
    };

    const toAward = Object.entries(conditions)
      .filter(([cond, met]) => met && !earned.has(cond as BadgeCondition))
      .map(([cond]) => cond as BadgeCondition);

    if (!toAward.length) return [];

    const badges = await this.prisma.badge.findMany({
      where: { condition: { in: toAward } },
    });

    await this.prisma.$transaction([
      this.prisma.userBadge.createMany({
        data: badges.map((b) => ({ userId, badgeId: b.id })),
        skipDuplicates: true,
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { globalXp: { increment: badges.reduce((sum, b) => sum + b.xpReward, 0) } },
      }),
    ]);

    return badges.map((b) => b.name);
  }
}
