import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { ApplicationsModule } from './applications/applications.module';
import { ExtensionModule } from './extension/extension.module';
import { NotesModule } from './notes/notes.module';
import { FeedbackModule } from './feedback/feedback.module';
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
    UsersModule,
    AuthModule,
    ProfileModule,
    ApplicationsModule,
    AdminModule,
    ExtensionModule,
    NotesModule,
    FeedbackModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
