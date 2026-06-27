import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#020617] text-[#111827] dark:text-[#E5E7EB]">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div>
          <Link href="/" className="text-sm text-[#2563EB] hover:underline">
            ← Back to ApplyFlow
          </Link>
          <h1 className="text-3xl font-bold mt-4">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: June 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What we collect</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            ApplyFlow stores account information (name, email), profile data (CV, answers, application history), and usage data needed to provide autofill and tracking features.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Chrome extension</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The extension reads form fields on job application pages you visit to autofill data from your profile. It does not collect passwords or payment card data from third-party sites.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Third-party services</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We may use Stripe (billing), OpenAI (optional job analysis), and email providers (reminders). Data shared is limited to what is required for each service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Your rights</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You can update or delete your profile data from the app. Contact support to request account deletion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Questions: support@applyflow.app
          </p>
        </section>
      </div>
    </div>
  );
}
