import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AxisType } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanService } from './plan.service';

@UseGuards(JwtAuthGuard)
@Controller('plan')
export class PlanController {
  constructor(private plan: PlanService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreatePlanDto) {
    return this.plan.create(user.id, dto);
  }

  @Get()
  get(@CurrentUser() user: any) {
    return this.plan.findByUser(user.id);
  }

  @Patch('axes/:axisType/toggle')
  toggleAxis(@CurrentUser() user: any, @Param('axisType') axisType: AxisType) {
    return this.plan.toggleAxis(user.id, axisType);
  }
}
