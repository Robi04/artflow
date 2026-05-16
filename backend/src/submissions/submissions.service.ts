import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AxisType } from '../../generated/prisma/client';
import { BadgesService } from '../badges/badges.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

const XP_PER_LEVEL = 200;

const AXIS_LABELS: Record<AxisType, string> = {
  ANATOMY: 'anatomy and figure drawing',
  PERSPECTIVE: 'perspective and spatial construction',
  COMPOSITION: 'composition and visual balance',
  VALUES: 'values, light and shadow',
  COLORS: 'color theory and color harmony',
  FIND_MY_STYLE: 'finding your personal art style',
  LONG_PROJECT: 'long-term art project',
};

@Injectable()
export class SubmissionsService {
  private gemini: GoogleGenerativeAI | null = null;

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private badgesService: BadgesService,
    config: ConfigService,
  ) {
    const apiKey = config.get<string>('GEMINI_API_KEY');
    if (apiKey) this.gemini = new GoogleGenerativeAI(apiKey);
  }

  private async getAiFeedback(
    file: Express.Multer.File,
    axisType: AxisType,
    level: number,
  ): Promise<object> {
    if (this.gemini) {
      try {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `You are an art teacher reviewing a student's weekly practice submission focused on ${AXIS_LABELS[axisType]} (student level: ${level}/10).
Analyze the artwork and return ONLY a JSON object with:
- "score": number 1-10
- "strengths": array of 2-3 short strings
- "improvements": array of 2-3 short strings
- "comment": one encouraging sentence summarizing the feedback`;

        const result = await model.generateContent([
          prompt,
          { inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') } },
        ]);
        const text = result.response.text().trim().replace(/```json\n?|\n?```/g, '');
        return JSON.parse(text);
      } catch {
        // fall through to default
      }
    }

    return {
      score: 7,
      strengths: ['Good effort this week', 'Consistent practice'],
      improvements: ['Keep exploring the fundamentals', 'Try different references'],
      comment: `Great work on your ${AXIS_LABELS[axisType]} practice this week!`,
    };
  }

  async submit(userId: string, missionId: string, file: Express.Multer.File) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        userAxis: { include: { plan: { select: { userId: true } } } },
        submission: true,
      },
    });

    if (!mission || mission.userAxis.plan.userId !== userId) {
      throw new NotFoundException('Mission not found');
    }
    if (mission.submission) {
      throw new BadRequestException('Mission already submitted');
    }

    const imageUrl = await this.supabase.uploadImage(file, userId);
    const aiFeedback = await this.getAiFeedback(file, mission.userAxis.axisType, mission.userAxis.level);

    const [submission] = await this.prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: { missionId, imageUrl, aiFeedback, xpEarned: mission.xpReward },
      });

      await tx.mission.update({
        where: { id: missionId },
        data: { status: 'COMPLETED' },
      });

      const updatedAxis = await tx.userAxis.update({
        where: { id: mission.userAxisId },
        data: { xp: { increment: mission.xpReward } },
      });

      if (updatedAxis.xp >= updatedAxis.level * XP_PER_LEVEL) {
        await tx.userAxis.update({
          where: { id: mission.userAxisId },
          data: { level: { increment: 1 } },
        });
      }

      const user = await tx.user.findUnique({ where: { id: userId }, select: { lastSubmissionAt: true, streakCount: true } });
      const lastSub = user?.lastSubmissionAt;
      const daysSinceLast = lastSub ? (Date.now() - lastSub.getTime()) / 86400000 : null;
      const newStreak = daysSinceLast === null || daysSinceLast > 14 ? 1 : (user?.streakCount ?? 0) + 1;

      await tx.user.update({
        where: { id: userId },
        data: {
          globalXp: { increment: mission.xpReward },
          lastSubmissionAt: new Date(),
          streakCount: newStreak,
        },
      });

      return [sub];
    });

    const newBadges = await this.badgesService.checkAndAward(userId);
    return { submission, aiFeedback, newBadges };
  }
}
