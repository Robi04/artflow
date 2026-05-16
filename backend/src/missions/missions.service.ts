import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AxisType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
export class MissionsService {
  private gemini: GoogleGenerativeAI | null = null;

  constructor(private prisma: PrismaService, config: ConfigService) {
    const apiKey = config.get<string>('GEMINI_API_KEY');
    if (apiKey) this.gemini = new GoogleGenerativeAI(apiKey);
  }

  private getWeek(date: Date): { weekNumber: number; year: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7);
    return { weekNumber, year: d.getUTCFullYear() };
  }

  private getDueAt(): Date {
    const now = new Date();
    const day = now.getUTCDay() || 7;
    const daysUntilSunday = 7 - day;
    const due = new Date(now);
    due.setUTCDate(now.getUTCDate() + daysUntilSunday);
    due.setUTCHours(23, 59, 59, 999);
    return due;
  }

  private async generateMissionContent(axisType: AxisType, level: number): Promise<{ title: string; description: string }> {
    if (this.gemini) {
      try {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Generate a weekly art practice mission for a student at level ${level} working on ${AXIS_LABELS[axisType]}.
Return ONLY a JSON object with "title" (max 8 words) and "description" (1-2 sentences, clear actionable instructions).
Example: {"title":"Draw 5 hands from different angles","description":"Sketch 5 hands from life or reference, focusing on proportions and knuckle placement. Spend at least 10 minutes per hand."}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const json = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(json);
      } catch {
        // fall through to default
      }
    }
    return this.defaultMission(axisType, level);
  }

  private defaultMission(axisType: AxisType, level: number): { title: string; description: string } {
    return {
      title: `${AXIS_LABELS[axisType]} — week practice`,
      description: `Spend at least 30 minutes this week practicing ${AXIS_LABELS[axisType]} at your current level ${level}.`,
    };
  }

  async getCurrentMissions(userId: string) {
    const { weekNumber, year } = this.getWeek(new Date());

    const plan = await this.prisma.plan.findUnique({
      where: { userId },
      include: { userAxes: { where: { isActive: true } } },
    });
    if (!plan) throw new NotFoundException('No plan found');

    const results = await Promise.all(
      plan.userAxes.map(async (axis) => {
        const existing = await this.prisma.mission.findUnique({
          where: { userAxisId_weekNumber_year: { userAxisId: axis.id, weekNumber, year } },
          include: { submission: true },
        });
        if (existing) return existing;

        const { title, description } = await this.generateMissionContent(axis.axisType, axis.level);
        return this.prisma.mission.create({
          data: {
            userAxisId: axis.id,
            weekNumber,
            year,
            title,
            description,
            xpReward: 100 + (axis.level - 1) * 10,
            dueAt: this.getDueAt(),
          },
          include: { submission: true },
        });
      }),
    );

    return { weekNumber, year, missions: results };
  }

  async findOne(userId: string, missionId: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        submission: true,
        userAxis: { include: { plan: { select: { userId: true } } } },
      },
    });
    if (!mission || mission.userAxis.plan.userId !== userId) {
      throw new NotFoundException('Mission not found');
    }
    return mission;
  }
}
