import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Edit3, LogOut, ChevronRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { generateUID } from '@/lib/data';

const USER_UID = generateUID();

type ProfileSubPage = null | 'edit' | 'notifications' | 'privacy' | 'settings';

interface ProfilePageProps {
  onNavigate?: (page: ProfileSubPage) => void;
  onLogout?: () => void;
  userName?: string;
  userAvatar?: string;
}

export function ProfilePage({ onNavigate, onLogout, userName = 'Your Name', userAvatar }: ProfilePageProps) {
  const [copied, setCopied] = useState(false);

  const copyUID = () => {
    navigator.clipboard.writeText(USER_UID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { icon: Edit3, label: 'Edit Profile', sub: 'Update your info', page: 'edit' as const },
    { icon: Bell, label: 'Notifications', sub: 'Manage alerts', page: 'notifications' as const },
    { icon: Shield, label: 'Privacy & Safety', sub: 'Moderation rules', page: 'privacy' as const },
    { icon: Settings, label: 'Settings', sub: 'Account preferences', page: 'settings' as const },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header gradient - reduced height */}
      <div className="relative gradient-hero px-4 pb-14 pt-10 sm:px-6 sm:pt-12">
        <h1 className="text-lg font-bold text-primary-foreground">My Profile</h1>
      </div>

      {/* Avatar card - avatar sits half on gradient, half on card */}
      <div className="px-4 -mt-10 sm:px-6">
        <div className="mx-auto max-w-lg rounded-3xl bg-card pt-14 pb-5 px-5 shadow-card text-center relative sm:px-6">
          {/* Avatar positioned to overlap the top edge */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-10">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="h-20 w-20 rounded-full object-cover border-4 border-card shadow-elevated"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground border-4 border-card shadow-elevated">
                {userName[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-foreground">{userName}</h2>
          <p className="text-sm text-muted-foreground">Set up your profile to get started</p>

          {/* UID */}
          <button
            onClick={copyUID}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:bg-muted/80"
          >
            UID: {USER_UID}
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          </button>

          <div className="mt-4 flex justify-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-lg font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mx-auto mt-6 max-w-lg px-4 space-y-2 sm:px-6">
        {menuItems.map(({ icon: Icon, label, sub, page }) => (
          <motion.button
            key={label}
            onClick={() => onNavigate?.(page)}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card text-left transition-colors hover:bg-muted/50 sm:gap-4 sm:p-4"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}

        <motion.button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card text-left transition-colors hover:bg-destructive/5 sm:gap-4 sm:p-4"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <p className="font-semibold text-destructive text-sm">Log Out</p>
        </motion.button>
      </div>
    </div>
  );
}
