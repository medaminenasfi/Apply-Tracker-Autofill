import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { AnswerVaultService } from '../answer-vault/answer-vault.service';
import { UserId } from '../common/utils/userId.util';

export interface AnalyzeJobResult {
  jobDescription: string;
  suggestedAnswers: Array<{ answerId: string; title: string; category: string; content: string; score: number }>;
  matchScore: number;
  missingKeywords: string[];
  summary: string;
}

interface CacheEntry {
  result: AnalyzeJobResult;
  at: number;
}

@Injectable()
export class AiService {
  private cache = new Map<string, CacheEntry>();
  private readonly cacheTtlMs = 1000 * 60 * 30; // 30 minutes

  constructor(
    private configService: ConfigService,
    private answerVaultService: AnswerVaultService,
  ) {}

  async analyzeJob(userId: UserId, jobDescription: string, cvText?: string): Promise<AnalyzeJobResult> {
    const jd = jobDescription.slice(0, 8000);
    const cv = (cvText || '').slice(0, 12000);
    const cacheKey = this.buildCacheKey(userId, jd, cv);

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.at < this.cacheTtlMs) {
      return { ...cached.result, summary: `${cached.result.summary} (cached)` };
    }

    const vault = await this.answerVaultService.findAll(userId);
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const result = apiKey
      ? await this.analyzeWithOpenAI(jd, vault, cv, apiKey)
      : this.analyzeHeuristic(jd, vault, cv);

    this.cache.set(cacheKey, { result, at: Date.now() });
    return result;
  }

  private buildCacheKey(userId: UserId, jd: string, cv: string): string {
    return createHash('sha256').update(`${userId}:${jd}:${cv}`).digest('hex');
  }

  private async analyzeWithOpenAI(jd: string, vault: any[], cvText: string, apiKey: string): Promise<AnalyzeJobResult> {
    const vaultJson = JSON.stringify(
      vault.map((v) => ({
        id: String(v._id),
        title: v.title,
        category: v.category,
        content: v.content.slice(0, 500),
      })),
    );

    const prompt = `Job description:\n${jd}\n\nCV excerpt:\n${cvText.slice(0, 2000)}\n\nAnswer vault:\n${vaultJson}\n\nRespond as JSON: {"matchScore":0-100,"missingKeywords":["..."],"summary":"...","suggestedAnswerIds":["id1"]}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');

    const suggestedAnswers = (parsed.suggestedAnswerIds || [])
      .map((id: string) => vault.find((v) => String(v._id) === id))
      .filter(Boolean)
      .map((v: any, i: number) => ({
        answerId: String(v._id),
        title: v.title,
        category: v.category,
        content: v.content,
        score: 100 - i * 10,
      }));

    return {
      jobDescription: jd,
      suggestedAnswers,
      matchScore: parsed.matchScore ?? 70,
      missingKeywords: parsed.missingKeywords ?? [],
      summary: parsed.summary ?? 'AI analysis complete.',
    };
  }

  private analyzeHeuristic(jd: string, vault: any[], cvText: string): AnalyzeJobResult {
    const jdLower = jd.toLowerCase();
    const cvLower = cvText.toLowerCase();
    const words = [...new Set(jdLower.match(/\b[a-z]{4,}\b/g) || [])].slice(0, 30);
    const missingKeywords = words.filter((w) => !cvLower.includes(w)).slice(0, 5);
    const matchScore = Math.max(20, Math.min(95, Math.round(100 - missingKeywords.length * 8)));

    const suggestedAnswers = vault
      .map((v) => {
        const contentLower = v.content.toLowerCase();
        const overlap = words.filter((w) => contentLower.includes(w)).length;
        return { v, overlap };
      })
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 3)
      .map(({ v }, i) => ({
        answerId: String(v._id),
        title: v.title,
        category: v.category,
        content: v.content,
        score: 90 - i * 15,
      }));

    return {
      jobDescription: jd,
      suggestedAnswers,
      matchScore,
      missingKeywords,
      summary: cvText
        ? 'Heuristic match based on CV text and job description.'
        : `Upload a CV for a more accurate score. ${missingKeywords.length ? 'Some keywords from the job are missing from your CV.' : 'Good keyword overlap.'}`,
    };
  }
}
