'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { billingApi, BillingPlans } from '@/services/billing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function PricingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<BillingPlans | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    billingApi.getPlans().then(setPlans).catch(() => setPlans(null));
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }
    setLoading(true);
    try {
      const { url } = await billingApi.checkout();
      if (url) window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Checkout unavailable');
    } finally {
      setLoading(false);
    }
  };

  if (!plans) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading plans…</p>
      </div>
    );
  }

  const tiers = [
    { key: 'free', ...plans.free, cta: 'Current plan', highlight: false },
    { key: 'pro', ...plans.pro, cta: 'Upgrade to Pro', highlight: true },
    { key: 'advanced', ...plans.advanced, cta: 'Contact us', highlight: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-16 px-4">
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">ApplyFlow Pricing</h1>
        <p className="text-muted-foreground">Start free. Upgrade when you need AI autofill, ghost save, and unlimited tracking.</p>
      </div>

      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.key} className={tier.highlight ? 'border-blue-500 shadow-lg' : ''}>
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>
                {'priceMonthly' in tier && tier.priceMonthly != null
                  ? `$${tier.priceMonthly}/mo`
                  : tier.price === 0
                    ? 'Free'
                    : 'Custom'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-left">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {tier.key === 'pro' ? (
                <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
                  {loading ? 'Redirecting…' : tier.cta}
                </Button>
              ) : tier.key === 'free' ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={user ? '/applicant' : '/register'}>{user ? 'Go to dashboard' : 'Get started'}</Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/feedback">Contact us</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
