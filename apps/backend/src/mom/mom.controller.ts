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

  @Post(':id/send-review')
  async sendForReview(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.MomService.sendForReview(id, req);
  }

  @Post(':id/send-approval')
  async sendForApproval(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.MomService.sendForApproval(id, req);
  }

  @Post(':id/reject-review')
  async rejectByReviewer(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.MomService.rejectByReviewer(id, req);
  }

  @Post(':id/approve')
  async approve(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.MomService.approve(id, req);
  }

  @Post(':id/reject-approval')
  async rejectByApprover(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.MomService.rejectByApprover(id, req);
  }

  @Post(':id/close')
  async closeMom(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.MomService.closeMom(id, req);
  }
}
