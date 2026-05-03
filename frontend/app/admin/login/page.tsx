'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/services/api';
import { Shield, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const setAdmin = useAuthStore((state) => state.setAdmin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminApi.post('/auth/login', { email, password });

      if (response.data.user.role !== 'admin') {
        setError('Access denied. Admin role required.');
        toast.error('Unauthorized access');
        return;
      }

      setAdmin(response.data.user);
      toast.success('Admin login successful');
      router.push('/admin/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#020617] p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#111827]/60 dark:text-[#E5E7EB]/50 hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0B1220] p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40 mt-2">
              Enter your admin credentials to access the panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#111827] dark:text-[#E5E7EB]">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F9FAFB] dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] placeholder:text-[#111827]/30 dark:placeholder:text-[#E5E7EB]/30 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#111827] dark:text-[#E5E7EB]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F9FAFB] dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] placeholder:text-[#111827]/30 dark:placeholder:text-[#E5E7EB]/30 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111827]/30 dark:text-[#E5E7EB]/30 hover:text-[#111827] dark:hover:text-[#E5E7EB] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#111827]/30 dark:text-[#E5E7EB]/30 mt-6">
          Protected by ApplyFlow Security
        </p>
      </div>
    </div>
  );
}
