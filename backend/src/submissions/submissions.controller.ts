import { Controller, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubmissionsService } from './submissions.service';

@UseGuards(JwtAuthGuard)
@Controller('missions')
export class SubmissionsController {
  constructor(private submissions: SubmissionsService) {}

  @Post(':id/submit')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } }))
  submit(
    @CurrentUser() user: any,
    @Param('id') missionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.submissions.submit(user.id, missionId, file);
  }
}
