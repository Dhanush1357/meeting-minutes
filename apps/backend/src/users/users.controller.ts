import { Controller, Get, Patch, Body, Param, ParseIntPipe, Req  } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Get()
  async getUsers(@Req() req) {
    return this.UsersService.getUsers(req);
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.UsersService.getUserById(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number, // ✅ Convert id to a number
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.UsersService.updateUser(id, updateUserDto);
  }
}
