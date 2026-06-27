import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnswerVaultModule } from '../answer-vault/answer-vault.module';

@Module({
  imports: [AnswerVaultModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
