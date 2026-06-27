import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ReminderItem } from '../../reminders/reminders.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>('EMAIL_USER') || this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('EMAIL_PASSWORD') || this.configService.get<string>('SMTP_PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('EMAIL_HOST') || this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
        port: Number(this.configService.get<string>('EMAIL_PORT') || this.configService.get<string>('SMTP_PORT') || 587),
        secure: false,
        auth: { user, pass },
      });
    }
  }

  isConfigured(): boolean {
    return !!this.transporter;
  }

  private getFromAddress(): string {
    return (
      this.configService.get<string>('EMAIL_FROM') ||
      this.configService.get<string>('SMTP_FROM') ||
      'noreply@applyflow.app'
    );
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetLink = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    if (!this.transporter) {
      console.warn('[EMAIL] SMTP not configured — password reset email skipped');
      throw new Error('Failed to send email');
    }

    await this.transporter.sendMail(mailOptions);
    return { message: 'Email sent successfully' };
  }

  async sendReminderDigest(email: string, reminders: ReminderItem[]) {
    if (!this.transporter || !reminders.length) return false;

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const itemsHtml = reminders
      .map(
        (r) =>
          `<li><strong>${r.companyName}</strong> — ${r.position}<br/><span>${r.message}</span></li>`,
      )
      .join('');

    await this.transporter.sendMail({
      from: this.getFromAddress(),
      to: email,
      subject: `ApplyFlow — ${reminders.length} application reminder${reminders.length > 1 ? 's' : ''}`,
      html: `
        <h2>Your ApplyFlow reminders</h2>
        <ul>${itemsHtml}</ul>
        <p><a href="${frontendUrl}/notifications">View all reminders</a> · <a href="${frontendUrl}/applicant">Open tracker</a></p>
      `,
    });

    return true;
  }
}
