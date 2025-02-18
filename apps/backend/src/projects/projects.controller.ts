import { Controller, Get, Put, Body, Param, Post, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly ProjectsService: ProjectsService) {}

  @Get()
  async getProjects() {
    return this.ProjectsService.getProjects();
  }

  @Get(':id')
  async getProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.ProjectsService.getProjectById(id);
  }

  @Post()
  async createProject(@Body() data) {
    return this.ProjectsService.createProject(data);
  }
}
