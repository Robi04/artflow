import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLongProjectDto } from './dto/create-long-project.dto';
import { LongProjectsService } from './long-projects.service';

@UseGuards(JwtAuthGuard)
@Controller('long-projects')
export class LongProjectsController {
  constructor(private projects: LongProjectsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateLongProjectDto) {
    return this.projects.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.projects.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projects.findOne(user.id, id);
  }

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } }))
  addPhoto(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.projects.addPhoto(user.id, id, file);
  }

  @Patch(':id/complete')
  complete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projects.complete(user.id, id);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projects.delete(user.id, id);
  }
}
