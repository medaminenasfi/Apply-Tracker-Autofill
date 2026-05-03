'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ArrowLeft, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { AuthLayout } from '@/components/auth/AuthLayout';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      toast.error('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!isValidToken) {
      toast.error('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.password,
      });

      if (response.data.message) {
        toast.success(response.data.message);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent pr-10 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  if (!isValidToken) {
    return (
      <AuthLayout variant="forgot-password">
        <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            This password reset link is invalid or has expired.
          </p>
          <div className="space-y-3 flex flex-col items-center">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8] dark:text-[#3B82F6] dark:hover:text-[#60A5FA] transition-colors"
            >
              Request a new reset link
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
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
            Reset password
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your new password below.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter new password"
                        type={showPassword ? 'text' : 'password'}
                        className={inputClass}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Confirm new password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={inputClass}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                  <Spinner className="h-4 w-4" />
                  Resetting...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Reset password
                </>
              )}
            </button>
          </form>
        </Form>

        {/* Links */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#EEF2FF,#F8FAFC)] dark:bg-[radial-gradient(circle_at_top,#0f172a,#020617)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
