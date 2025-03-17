import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Post,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { UpdateProjectDto } from './dto/update-project.dto';

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

  @Patch(':id')
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req
  ) {
    return this.ProjectsService.updateProject(id, updateProjectDto, req);
  }

  @Post(':id/close')
  async closeProject(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ProjectsService.closeProject(id, req);
  }

  @Post(':id/remove-logo')
  async removeLogo(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ProjectsService.removeLogo(id, req);
  }
}
