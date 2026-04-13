import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Roles } from 'src/auth/decorators';
import { Role } from '@prisma/client';
import { AtGuard, RoleGuard } from 'src/auth/guards';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(AtGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Post('create')
  create(@Body() createCourseDto: CreateCourseDto, @Req() req) {
    const userId = req.user.userId;
    return this.courseService.create(createCourseDto,userId);
  }
}