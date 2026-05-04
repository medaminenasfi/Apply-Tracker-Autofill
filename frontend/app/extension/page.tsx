'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Download, Chrome, ExternalLink, CheckCircle, FileText, Zap, Shield, Globe, Copy, Check, AlertCircle, RefreshCw, HelpCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function ExtensionPage() {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const copyToClipboard = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopied(true);
    toast.success(t('extension.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      number: 1,
      title: 'Download the ZIP file',
      description: 'Click the download button to get the extension files.',
      icon: Download,
    },
    {
      number: 2,
      title: 'Extract the ZIP folder',
      description: 'Unzip the downloaded file to a folder on your computer.',
      icon: FileText,
    },
    {
      number: 3,
      title: 'Open Chrome Extensions',
      description: 'Navigate to chrome://extensions in your Chrome browser.',
      icon: Globe,
      hasCopy: true,
    },
    {
      number: 4,
      title: 'Enable Developer Mode',
      description: 'Toggle the "Developer mode" switch in the top right corner.',
      icon: Zap,
    },
    {
      number: 5,
      title: 'Load Unpacked Extension',
      description: 'Click the "Load unpacked" button that appears.',
      icon: Download,
    },
    {
      number: 6,
      title: 'Select the Extension Folder',
      description: 'Navigate to and select the extracted extension folder.',
      icon: FileText,
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Smart Autofill',
      description: 'Automatically fill job application forms with your profile data in seconds',
    },
    {
      icon: Download,
      title: 'Save Applications',
      description: 'Save job applications directly to your dashboard with one click',
    },
    {
      icon: FileText,
      title: 'Upload CV to Page',
      description: 'View and upload your CV directly from any job website',
    },
    {
      icon: Shield,
      title: 'Sync with Dashboard',
      description: 'Seamless authentication sync with your ApplyFlow dashboard',
    },
  ];

  const troubleshooting = [
    {
      icon: RefreshCw,
      title: 'Extension not showing?',
      description: 'Make sure Developer Mode is enabled and you selected the correct folder. Try reloading the extensions page.',
    },
    {
      icon: Shield,
      title: 'Sync not working?',
      description: 'Log out and log back into the extension using your dashboard credentials. Clear browser cache if needed.',
    },
    {
      icon: HelpCircle,
      title: 'CV upload blocked?',
      description: 'Some job sites block file uploads. Try using the autofill feature or upload your CV through the dashboard.',
    },
  ];

  return (
    <DashboardLayout title={t('extension.title')}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Card */}
        <div className="p-8 md:p-10 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-gradient-to-br from-[#2563EB]/5 to-[#7C3AED]/10 dark:from-[#2563EB]/10 dark:to-[#7C3AED]/15 shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t('extension.heroTitle')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-2xl">
                {t('extension.heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 hover:-translate-y-0.5 transition-all duration-300"
                  asChild
                >
                  <a href="/downloads/extension.zip" download>
                    <Download className="mr-2 h-5 w-5" />
                    {t('extension.downloadBtn')}
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                  onClick={() => document.getElementById('installation')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  {t('extension.howToInstall')}
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-[#2563EB]/20 to-[#7C3AED]/20 dark:from-[#2563EB]/30 dark:to-[#7C3AED]/30 flex items-center justify-center shadow-2xl">
                <Chrome className="w-24 h-24 md:w-28 md:h-28 text-[#2563EB] dark:text-[#7C3AED]" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('extension.featuresTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center mb-4">
                    <FeatureIcon className="h-6 w-6 text-[#2563EB]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Installation Steps - Vertical Timeline */}
        <div id="installation">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('extension.installationTitle')}</h2>
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            <div className="space-y-6">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex-shrink-0 relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white font-semibold text-sm shadow-md z-10 relative">
                        <StepIcon className="h-5 w-5" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-200 dark:bg-white/[0.10]" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{step.description}</p>
                      {step.hasCopy && (
                        <button
                          onClick={copyToClipboard}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500/20 transition-colors"
                        >
                          <code className="text-slate-900 dark:text-slate-100">chrome://extensions</code>
                          {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Troubleshooting Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('extension.troubleshootingTitle')}</h2>
          <div className="space-y-4">
            {troubleshooting.map((item, index) => {
              const TroubleshootIcon = item.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                      <TroubleshootIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-8 md:p-10 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('extension.ctaTitle')}</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            {t('extension.ctaSubtitle')}
          </p>
          <Button
            size="lg"
            className="text-base px-8 py-6 bg-white text-[#2563EB] hover:bg-slate-50 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
            asChild
          >
            <a href="/downloads/extension.zip" download>
              <Download className="mr-2 h-5 w-5" />
              Download Extension
            </a>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
