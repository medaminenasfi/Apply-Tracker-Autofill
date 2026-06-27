import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerVaultController } from './answer-vault.controller';
import { AnswerVaultService } from './answer-vault.service';
import { VaultAnswer, VaultAnswerSchema } from './schemas/vault-answer.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: VaultAnswer.name, schema: VaultAnswerSchema }])],
  controllers: [AnswerVaultController],
  providers: [AnswerVaultService],
  exports: [AnswerVaultService],
})
export class AnswerVaultModule {}
