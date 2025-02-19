import { Controller, Get, Put, Body, Param, Post, ParseIntPipe, Req  } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly ProjectsService: ProjectsService) {}

  @Get()
  async getProjects(@Req() req) {
    return this.ProjectsService.getProjects(req);
  }

  @Get(':id')
  async getProjectById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ProjectsService.getProjectById(id, req);
  }

  @Post()
  async createProject(@Body() data, @Req() req) {
    return this.ProjectsService.createProject(data, req);
  }
}
