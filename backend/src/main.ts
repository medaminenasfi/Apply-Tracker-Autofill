import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import * as path from 'path';
import { Connection } from 'mongoose';

async function checkUserIdConsistency(connection: Connection) {
  console.log('[SYSTEM CHECK] Verifying userId consistency across all collections...');
  
  try {
    const db = connection.db;
    if (!db) {
      console.warn('[SYSTEM CHECK] Database not available');
      return false;
    }
    
    const collections = await db.listCollections().toArray();
    
    let totalInvalid = 0;
    let totalChecked = 0;
    
    for (const collection of collections) {
      const collectionName = collection.name;
      
      // Skip collections without userId
      if (collectionName === 'admin' || collectionName === 'users') {
        continue;
      }
      
      const col = db.collection(collectionName);
      const invalidDocs = await col.find({
        userId: { $exists: true, $not: { $type: 'string' } }
      }).toArray();
      
      if (invalidDocs.length > 0) {
        console.warn(`[SYSTEM CHECK] WARNING: Found ${invalidDocs.length} documents with non-string userId in ${collectionName}`);
        invalidDocs.forEach(doc => {
          console.warn(`[SYSTEM CHECK] - Document _id: ${doc._id}, userId type: ${typeof doc.userId}`);
        });
        totalInvalid += invalidDocs.length;
      }
      
      totalChecked += await col.countDocuments({ userId: { $exists: true } });
    }
    
    if (totalInvalid === 0) {
      console.log('[SYSTEM CHECK] ✓ All userId fields are strings (checked ' + totalChecked + ' documents)');
    } else {
      console.error(`[SYSTEM CHECK] ✗ Found ${totalInvalid} documents with invalid userId types`);
      console.error('[SYSTEM CHECK] Run: node scripts/fix-userid-types.js to fix');
    }
    
    return totalInvalid === 0;
  } catch (error) {
    console.error('[SYSTEM CHECK] Error during consistency check:', error);
    return false;
  }
}

async function bootstrap() {
  console.log('[BOOTSTRAP] Starting application...');
  console.log('[BOOTSTRAP] Environment:', process.env.NODE_ENV || 'development');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable ValidationPipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(error => ({
          field: error.property,
          constraints: error.constraints,
          value: error.value,
        }));
        console.log('Validation errors:', messages);
        return new Error(JSON.stringify(messages));
      },
    }),
  );

  // Enable CORS - allow frontend origins
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-app-role'],
});

  // Health check endpoint
  app.use('/health', async (req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve static files for uploads with custom headers for PDF preview
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
      }
    },
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[BOOTSTRAP] Application is running on: http://localhost:${port}`);
  console.log(`[BOOTSTRAP] Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
