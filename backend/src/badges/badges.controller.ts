import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadgesService } from './badges.service';

@UseGuards(JwtAuthGuard)
@Controller('badges')
export class BadgesController {
  constructor(private badges: BadgesService) {}

  @Get()
  getAll() {
    return this.badges.getAll();
  }

  @Get('me')
  getMine(@CurrentUser() user: any) {
    return this.badges.getUserBadges(user.id);
  }
}
