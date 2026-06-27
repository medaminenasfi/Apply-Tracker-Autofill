import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { ApplicationsModule } from './applications/applications.module';
import { ExtensionModule } from './extension/extension.module';
import { NotesModule } from './notes/notes.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AnswerVaultModule } from './answer-vault/answer-vault.module';
import { BillingModule } from './billing/billing.module';
import { AiModule } from './ai/ai.module';
import { RemindersModule } from './reminders/reminders.module';
import { AutoApplyModule } from './auto-apply/auto-apply.module';
import { InterviewModule } from './interview/interview.module';
import { AchievementsModule } from './achievements/achievements.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');
        
        if (!mongoUri) {
          throw new Error('MONGO_URI is not defined in environment variables');
        }
        
        // Mask password for logging
        const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
        console.log('[DATABASE] Connecting to MongoDB:', maskedUri);
        
        return {
          uri: mongoUri,
          // Connection stability settings
          retryAttempts: 3,
          retryDelay: 1000,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    ApplicationsModule,
    AdminModule,
    ExtensionModule,
    NotesModule,
    FeedbackModule,
    AnswerVaultModule,
    BillingModule,
    AiModule,
    RemindersModule,
    AutoApplyModule,
    InterviewModule,
    AchievementsModule,
    EnterpriseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
