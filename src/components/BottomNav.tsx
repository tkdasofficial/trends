import { Home, MessageCircle, Search, User } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'chat' | 'profile';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  unreadCount?: number;
}

export function BottomNav({ active, onChange, unreadCount = 0 }: BottomNavProps) {
  const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: 'discover', icon: Home, label: 'Discover' },
    { id: 'matches', icon: Search, label: 'Matches' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" fill={isActive ? 'currentColor' : 'none'} />
              <span className="text-[10px] font-semibold">{label}</span>
              {id === 'chat' && unreadCount > 0 && (
                <span className="absolute -top-0.5 right-2 flex h-4 min-w-4 items-center justify-center rounded-full gradient-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
