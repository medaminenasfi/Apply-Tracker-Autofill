import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { InterviewSession, InterviewSessionDocument } from './schemas/interview.schema';
import { normalizeUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class InterviewService {
  constructor(
    @InjectModel(InterviewSession.name) private sessionModel: Model<InterviewSessionDocument>,
    private configService: ConfigService,
  ) {}

  async createSession(userId: UserId, data: { jobTitle: string; jobDescription?: string; applicationId?: string }) {
    const questions = await this.generateQuestions(data.jobTitle, data.jobDescription || '');
    const session = new this.sessionModel({
      userId: normalizeUserId(userId),
      jobTitle: data.jobTitle,
      applicationId: data.applicationId,
      questions,
      status: 'in_progress',
    });
    return session.save();
  }

  async submitAnswer(sessionId: string, userId: UserId, questionIndex: number, answer: string) {
    const session = await this.sessionModel.findOne({ _id: sessionId, userId: normalizeUserId(userId) }).exec();
    if (!session) return null;

    const question = session.questions[questionIndex];
    const feedback = await this.gradeAnswer(question, answer);

    session.responses.push({ question, answer, feedback });
    if (session.responses.length >= session.questions.length) {
      session.status = 'completed';
    }
    return session.save();
  }

  async listSessions(userId: UserId) {
    return this.sessionModel.find({ userId: normalizeUserId(userId) }).sort({ createdAt: -1 }).exec();
  }

  private async generateQuestions(jobTitle: string, jobDescription: string): Promise<string[]> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
              role: 'user',
              content: `Generate 5 interview questions for a ${jobTitle} role. Job description: ${jobDescription.slice(0, 1500)}. Return JSON: {"questions":["q1","q2",...]}`,
            }],
            response_format: { type: 'json_object' },
          }),
        });
        const data = await res.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        if (parsed.questions?.length) return parsed.questions.slice(0, 5);
      } catch {
        /* fallback below */
      }
    }

    return [
      `Tell me about your experience relevant to ${jobTitle}.`,
      'Describe a challenging project you worked on.',
      'Why are you interested in this role?',
      'How do you handle tight deadlines?',
      'What are your strengths for this position?',
    ];
  }

  private async gradeAnswer(question: string, answer: string): Promise<string> {
    if (!answer.trim()) return 'Please provide a more detailed answer.';
    if (answer.length < 50) return 'Good start — try adding a specific example or metric.';
    return 'Solid answer. Consider structuring with STAR (Situation, Task, Action, Result).';
  }
}
