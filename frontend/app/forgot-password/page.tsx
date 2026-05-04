'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import { ButtonSpinner } from '@/components/ui/AppLoader';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', data);
      
      if (response.data.message) {
        toast.success(response.data.message);
        setIsSubmitted(true);
      }
      
      // If email failed, show the reset link for testing
      if (response.data.resetToken) {
        console.log('Reset token:', response.data.resetToken);
        console.log('Reset link:', response.data.resetLink);
        toast.info('Email service not configured. Check console for reset link.');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout variant="forgot-password">
        <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t('auth.checkEmailTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            {t('auth.checkEmailSubtitle')}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
            {t('auth.checkEmailNote')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8] dark:text-[#3B82F6] dark:hover:text-[#60A5FA] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToLogin')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="forgot-password">
      <div className="flex flex-col justify-center h-full max-w-sm mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t('auth.forgotPasswordTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('auth.forgotPasswordSubtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('auth.email')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      type="email"
                      className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <ButtonSpinner />
                  {t('auth.sending')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('auth.sendResetLink')}
                </>
              )}
            </button>
          </form>
        </Form>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
