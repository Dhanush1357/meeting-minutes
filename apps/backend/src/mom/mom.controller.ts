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
import { MomService } from './mom.service';
import { UpdateMomDto } from './dto/update-mom.dto';

@Controller('mom')
export class MomController {
  constructor(private readonly MomService: MomService) {}

  @Get()
  async getMom(@Req() req) {
    return this.MomService.getMom(req);
  }

  @Get(':id')
  async getMomById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.MomService.getMomById(id, req);
  }

  @Post()
  async createMom(@Body() data, @Req() req) {
    return this.MomService.createMom(data, req);
  }

  @Patch(':id')
  async updateMom(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMomDto: UpdateMomDto,
    @Req() req
  ) {
    return this.MomService.updateMom(id, updateMomDto, req);
  }
}
