import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface NotificationsPageProps {
  onBack: () => void;
}

interface NotifSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: 'matches', label: 'New Matches', description: 'When someone likes you back', enabled: true },
    { id: 'messages', label: 'Messages', description: 'New chat messages', enabled: true },
    { id: 'calls', label: 'Incoming Calls', description: 'Audio call notifications', enabled: true },
    { id: 'files', label: 'File Transfers', description: 'When someone sends you a file', enabled: true },
    { id: 'likes', label: 'Likes', description: 'When someone likes your profile', enabled: false },
    { id: 'promo', label: 'Promotions', description: 'App updates and offers', enabled: false },
  ]);

  const toggle = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-lg space-y-2">
          {settings.map(s => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
              <div className={`h-6 w-11 rounded-full p-0.5 transition-colors ${s.enabled ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${s.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
