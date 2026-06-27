import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// pdf-parse has no stable ESM export in this project setup
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

@Injectable()
export class CvTextService {
  private cache = new Map<string, { text: string; at: number }>();
  private readonly ttlMs = 1000 * 60 * 60; // 1 hour

  async extractFromFilePath(filePath: string): Promise<string> {
    const resolved = path.resolve(filePath);
    const cached = this.cache.get(resolved);
    if (cached && Date.now() - cached.at < this.ttlMs) {
      return cached.text;
    }

    if (!fs.existsSync(resolved)) {
      return '';
    }

    const buffer = fs.readFileSync(resolved);
    const parsed = await pdfParse(buffer);
    const text = (parsed.text || '').replace(/\s+/g, ' ').trim().slice(0, 12000);
    this.cache.set(resolved, { text, at: Date.now() });
    return text;
  }

  async extractFromCvUrl(cvUrl: string): Promise<string> {
    if (!cvUrl) return '';
    const filename = path.basename(cvUrl);
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = path.join(process.cwd(), 'uploads', 'cv', safeFilename);
    return this.extractFromFilePath(filePath);
  }
}
