import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { BadgesService } from '../badges/badges.service';
import { CreateLongProjectDto } from './dto/create-long-project.dto';

@Injectable()
export class LongProjectsService {
  private gemini: GoogleGenerativeAI | null = null;

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private badges: BadgesService,
    config: ConfigService,
  ) {
    const apiKey = config.get<string>('GEMINI_API_KEY');
    if (apiKey) this.gemini = new GoogleGenerativeAI(apiKey);
  }

  private async getPhotoFeedback(file: Express.Multer.File, projectTitle: string): Promise<object | null> {
    if (!this.gemini) return null;
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `You are reviewing a progress photo for a long-term art project titled "${projectTitle}".
Return ONLY a JSON object with:
- "observation": one sentence describing what you see in the artwork
- "progress": one sentence of encouragement about their progress
- "suggestion": one actionable suggestion for the next step`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') } },
      ]);
      const text = result.response.text().trim().replace(/```json\n?|\n?```/g, '');
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  private assertOwner(project: { userId: string } | null, userId: string) {
    if (!project || project.userId !== userId) throw new NotFoundException('Project not found');
  }

  async create(userId: string, dto: CreateLongProjectDto) {
    return this.prisma.longProject.create({
      data: { userId, title: dto.title, description: dto.description },
    });
  }

  async findAll(userId: string) {
    return this.prisma.longProject.findMany({
      where: { userId },
      include: { photos: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, projectId: string) {
    const project = await this.prisma.longProject.findUnique({
      where: { id: projectId },
      include: { photos: { orderBy: { createdAt: 'asc' } } },
    });
    this.assertOwner(project, userId);
    return project;
  }

  async addPhoto(userId: string, projectId: string, file: Express.Multer.File) {
    const project = await this.prisma.longProject.findUnique({ where: { id: projectId } });
    this.assertOwner(project, userId);
    if (project!.status === 'COMPLETED') throw new BadRequestException('Project already completed');

    const imageUrl = await this.supabase.uploadImage(file, `long-projects/${userId}`);
    const aiFeedback = (await this.getPhotoFeedback(file, project!.title)) ?? undefined;

    return this.prisma.longProjectPhoto.create({
      data: { projectId, imageUrl, aiFeedback },
    });
  }

  async complete(userId: string, projectId: string) {
    const project = await this.prisma.longProject.findUnique({ where: { id: projectId } });
    this.assertOwner(project, userId);
    if (project!.status === 'COMPLETED') throw new BadRequestException('Already completed');

    const updated = await this.prisma.longProject.update({
      where: { id: projectId },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { photos: true },
    });

    const newBadges = await this.badges.checkAndAward(userId);
    return { project: updated, newBadges };
  }

  async archive(userId: string, projectId: string) {
    const project = await this.prisma.longProject.findUnique({ where: { id: projectId } });
    this.assertOwner(project, userId);
    return this.prisma.longProject.update({
      where: { id: projectId },
      data: { status: 'ARCHIVED' },
    });
  }

  async delete(userId: string, projectId: string) {
    const project = await this.prisma.longProject.findUnique({ where: { id: projectId } });
    this.assertOwner(project, userId);
    await this.prisma.longProject.delete({ where: { id: projectId } });
    return { deleted: true };
  }
}
