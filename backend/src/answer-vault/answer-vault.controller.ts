import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AnswerVaultService } from './answer-vault.service';
import { CreateVaultAnswerDto, UpdateVaultAnswerDto } from './dto/vault-answer.dto';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('answer-vault')
@UseGuards(AuthGuard('jwt'))
export class AnswerVaultController {
  constructor(private answerVaultService: AnswerVaultService) {}

  @Get()
  async list(@GetUser() user: any) {
    return this.answerVaultService.findAll(normalizeUserId(user._id));
  }

  @Post()
  async create(@GetUser() user: any, @Body() dto: CreateVaultAnswerDto) {
    return this.answerVaultService.create(normalizeUserId(user._id), dto);
  }

  @Put(':id')
  async update(@GetUser() user: any, @Param('id') id: string, @Body() dto: UpdateVaultAnswerDto) {
    return this.answerVaultService.update(id, normalizeUserId(user._id), dto);
  }

  @Delete(':id')
  async remove(@GetUser() user: any, @Param('id') id: string) {
    return this.answerVaultService.delete(id, normalizeUserId(user._id));
  }

  @Post('sync')
  async sync(@GetUser() user: any, @Body() body: { answers: CreateVaultAnswerDto[] }) {
    return this.answerVaultService.syncReplaceAll(normalizeUserId(user._id), body.answers || []);
  }
}
