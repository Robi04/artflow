import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MissionsService } from './missions.service';

@UseGuards(JwtAuthGuard)
@Controller('missions')
export class MissionsController {
  constructor(private missions: MissionsService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: any) {
    return this.missions.getCurrentMissions(user.id);
  }

  @Get(':id')
  getOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.missions.findOne(user.id, id);
  }
}
