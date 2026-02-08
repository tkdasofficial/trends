import { ArrowLeft, FileText, Shield, Users, AlertTriangle } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
  page?: 'terms' | 'privacy-policy';
}

export function TermsPage({ onBack, page = 'terms' }: TermsPageProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {page === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-lg space-y-5">
          {page === 'terms' ? <TermsContent /> : <PrivacyPolicyContent />}

          <p className="text-center text-xs text-muted-foreground pt-4 pb-8">
            Last updated: February 2026
          </p>
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  const sections = [
    {
      icon: FileText,
      title: '1. Acceptance of Terms',
      content: 'By creating an account or using Trends, you agree to be bound by these Terms & Conditions. If you do not agree, you must not use the service. You must be at least 18 years old to use Trends.',
    },
    {
      icon: Users,
      title: '2. User Conduct',
      content: 'You agree to use Trends responsibly. Prohibited activities include: harassment, impersonation, sharing illegal content, spam, using automated bots, and any form of discrimination. Violation may result in immediate account termination.',
    },
    {
      icon: Shield,
      title: '3. Content & Moderation',
      content: 'All messages are subject to automated content filtering. Profiles must contain genuine photos of yourself. Misleading or fake profiles will be removed. You retain ownership of your content but grant Trends a license to display it within the platform.',
    },
    {
      icon: AlertTriangle,
      title: '4. Account Termination',
      content: 'We reserve the right to suspend or terminate accounts that violate these terms. Users who accumulate 10 or more content violations will face automatic restrictions. You may delete your account at any time through Settings.',
    },
    {
      icon: FileText,
      title: '5. Disclaimers',
      content: 'Trends is provided "as is" without warranties. We do not guarantee matches, connections, or outcomes. We are not responsible for user behavior or interactions that occur outside the platform. Use caution when meeting people in person.',
    },
    {
      icon: Shield,
      title: '6. Limitation of Liability',
      content: 'Trends shall not be liable for indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you, if any, in the 12 months preceding the claim.',
    },
  ];

  return (
    <>
      {sections.map((s, idx) => (
        <div key={idx} className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
            <s.icon className="h-4 w-4 text-primary shrink-0" />
            {s.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{s.content}</p>
        </div>
      ))}
    </>
  );
}

function PrivacyPolicyContent() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly: name, email, date of birth, gender, photos, bio, and location. We also collect usage data including device information, IP address, and app interaction patterns.',
    },
    {
      title: '2. How We Use Your Information',
      content: 'Your data is used to: create and manage your account, display your profile to potential matches, facilitate messaging and calls, improve our service, ensure safety and prevent fraud, and send you relevant notifications.',
    },
    {
      title: '3. Data Storage & Security',
      content: 'Profile data is stored on Firebase (Google Cloud). Profile images are stored on secure cloud storage. All data transmission is encrypted using TLS. Audio calls use WebRTC with end-to-end encryption. We do not sell your personal data to third parties.',
    },
    {
      title: '4. Your Rights',
      content: 'You have the right to: access your personal data, correct inaccurate data, delete your account and all associated data, export your data, and withdraw consent for data processing. Exercise these rights through Settings or by contacting support.',
    },
    {
      title: '5. Data Retention',
      content: 'We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days. Anonymized usage statistics may be retained for analytics purposes.',
    },
  ];

  return (
    <>
      {sections.map((s, idx) => (
        <div key={idx} className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold text-foreground mb-2">{s.title}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{s.content}</p>
        </div>
      ))}
    </>
  );
}
