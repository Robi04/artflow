import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AxisType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Plan already exists');

    if (!dto.axes?.length) throw new BadRequestException('Select at least one axis');

    return this.prisma.plan.create({
      data: {
        userId,
        userAxes: {
          create: dto.axes.map((axisType) => ({ axisType })),
        },
      },
      include: { userAxes: true },
    });
  }

  async findByUser(userId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { userId },
      include: {
        userAxes: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!plan) throw new NotFoundException('No plan found');
    return plan;
  }

  async toggleAxis(userId: string, axisType: AxisType) {
    const plan = await this.prisma.plan.findUnique({ where: { userId } });
    if (!plan) throw new NotFoundException('No plan found');

    const axis = await this.prisma.userAxis.findUnique({
      where: { planId_axisType: { planId: plan.id, axisType } },
    });
    if (!axis) throw new NotFoundException('Axis not found');

    return this.prisma.userAxis.update({
      where: { id: axis.id },
      data: { isActive: !axis.isActive },
    });
  }
}
