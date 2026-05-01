'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Chrome, ExternalLink, CheckCircle } from 'lucide-react';

export default function ExtensionPage() {
  const steps = [
    {
      number: 1,
      title: 'Download the ZIP file',
      description: 'Click the download button below to get the extension files.',
    },
    {
      number: 2,
      title: 'Extract the ZIP folder',
      description: 'Unzip the downloaded file to a folder on your computer.',
    },
    {
      number: 3,
      title: 'Open Chrome Extensions',
      description: 'Navigate to chrome://extensions in your Chrome browser.',
    },
    {
      number: 4,
      title: 'Enable Developer Mode',
      description: 'Toggle the "Developer mode" switch in the top right corner.',
    },
    {
      number: 5,
      title: 'Load Unpacked Extension',
      description: 'Click the "Load unpacked" button that appears.',
    },
    {
      number: 6,
      title: 'Select the Extension Folder',
      description: 'Navigate to and select the extracted extension folder.',
    },
  ];

  return (
    <DashboardLayout title="Chrome Extension">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Chrome className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl">Download Chrome Extension</CardTitle>
            <CardDescription className="text-lg mt-2 max-w-2xl mx-auto">
              Use our Chrome extension to autofill job application forms and save applications directly to your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              asChild
            >
              <a href="/downloads/extension.zip" download>
                <Download className="mr-2 h-5 w-5" />
                Download Extension
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Installation Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Installation Steps</CardTitle>
            <CardDescription>Follow these steps to install the extension</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle>Extension Features</CardTitle>
            <CardDescription>What you can do with the extension</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Autofill Forms</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically fill job application forms with your profile data
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Save Applications</h4>
                  <p className="text-sm text-muted-foreground">
                    Save job applications directly to your dashboard with one click
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Token Sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Seamless authentication sync with the website
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">CV Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    View your uploaded CV directly in the extension popup
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you encounter any issues during installation, make sure you have the latest version of Chrome
              and that Developer Mode is properly enabled. For more detailed instructions, refer to the
              Chrome Extension documentation.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
