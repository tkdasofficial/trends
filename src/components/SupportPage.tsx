import { ArrowLeft, MessageCircle, Mail, Shield, HelpCircle, ExternalLink } from 'lucide-react';

interface SupportPageProps {
  onBack: () => void;
}

export function SupportPage({ onBack }: SupportPageProps) {
  const faqs = [
    { q: 'How do I get verified?', a: 'Upload 5 clear face photos in Edit Profile and verify your email address. Once both are complete, you\'ll receive a green verification badge.' },
    { q: 'How do I find someone by UID?', a: 'Go to the Discover tab and enter their 12-character UID in the search bar (e.g., TR-A1B2C3D4E5F6).' },
    { q: 'Are my messages private?', a: 'Yes. Messages are encrypted in transit and only visible to the sender and receiver. Content moderation filters apply to prevent harmful content.' },
    { q: 'How do audio calls work?', a: 'Audio calls use WebRTC for direct device-to-device communication. Both users must be online for the call to connect.' },
    { q: 'What file types can I share?', a: 'You can share any file type. Both users must be online — the recipient must accept the file before the transfer begins.' },
    { q: 'How do I delete my account?', a: 'Go to Profile → Settings → Delete Account. This action is permanent and cannot be undone.' },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Help & Support</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Contact */}
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <h2 className="text-base font-bold text-foreground mb-3">Contact Us</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email Support</p>
                  <p className="text-xs text-muted-foreground">support@trends.app</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">In-App Feedback</p>
                  <p className="text-xs text-muted-foreground">Send feedback directly from the app</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold text-foreground mb-1">{faq.q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety */}
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Safety Center
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you feel unsafe or experience harassment, use the Report button on any user's profile. 
              Our moderation team reviews reports within 24 hours. In case of emergency, please contact your local authorities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
