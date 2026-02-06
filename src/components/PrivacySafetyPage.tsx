import { useState } from 'react';
import { ArrowLeft, Shield, Eye, EyeOff, Ban, Flag } from 'lucide-react';

interface PrivacySafetyPageProps {
  onBack: () => void;
}

export function PrivacySafetyPage({ onBack }: PrivacySafetyPageProps) {
  const [showOnline, setShowOnline] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [showAge, setShowAge] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [contentFilter, setContentFilter] = useState(true);

  const toggles = [
    { label: 'Show Online Status', description: 'Let others see when you\'re active', value: showOnline, toggle: () => setShowOnline(!showOnline), icon: Eye },
    { label: 'Show Distance', description: 'Display distance on your profile', value: showDistance, toggle: () => setShowDistance(!showDistance), icon: EyeOff },
    { label: 'Show Age', description: 'Display your age publicly', value: showAge, toggle: () => setShowAge(!showAge), icon: Eye },
    { label: 'Read Receipts', description: 'Let others know you\'ve read messages', value: readReceipts, toggle: () => setReadReceipts(!readReceipts), icon: Eye },
    { label: 'Content Filter', description: 'Auto-censor inappropriate messages', value: contentFilter, toggle: () => setContentFilter(!contentFilter), icon: Shield },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Privacy & Safety</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-lg space-y-2">
          {/* Privacy toggles */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Privacy</p>
          {toggles.map(t => (
            <button
              key={t.label}
              onClick={t.toggle}
              className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <t.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <div className={`h-6 w-11 rounded-full p-0.5 transition-colors ${t.value ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${t.value ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          ))}

          {/* Safety section */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-1">Safety</p>
          <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
                <Ban className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Blocked Users</p>
                <p className="text-xs text-muted-foreground">0 users blocked</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
                <Flag className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Report History</p>
                <p className="text-xs text-muted-foreground">0 reports submitted</p>
              </div>
            </div>
          </div>

          {/* Moderation info */}
          <div className="mt-4 rounded-2xl bg-primary/5 p-4 border border-primary/10">
            <p className="text-sm font-semibold text-foreground mb-1">Content Moderation</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trends uses automatic content filtering to keep conversations safe.
              Messages with inappropriate content are censored, and users who
              accumulate 10+ violations may be restricted. You can report any user
              from their profile page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
