import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Edit3, LogOut, ChevronRight, Copy, Check, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { generateUID } from '@/lib/data';
import { UserData } from '@/hooks/useUserStore';

const USER_UID = generateUID();

type ProfileSubPage = null | 'edit' | 'notifications' | 'privacy' | 'settings' | 'upgrade' | 'admin';

interface ProfilePageProps {
  onNavigate?: (page: ProfileSubPage) => void;
  onLogout?: () => void;
  userData?: UserData;
}

export function ProfilePage({ onNavigate, onLogout, userData }: ProfilePageProps) {
  const [copied, setCopied] = useState(false);
  const userName = userData?.name || 'Your Name';
  const profileImage = userData?.profileImage;
  const isVerified = userData?.isVerified || false;

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
      <div className="relative gradient-hero px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
        <h1 className="text-lg font-bold text-primary-foreground">My Profile</h1>
      </div>

      <div className="px-4 -mt-12 sm:px-6">
        <div className="mx-auto max-w-lg rounded-3xl bg-card pt-16 pb-5 px-5 shadow-card text-center relative sm:px-6">
          <div className="absolute left-1/2 -translate-x-1/2 -top-12">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={userName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-card shadow-elevated"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground border-4 border-card shadow-elevated">
                  {userName[0]?.toUpperCase() || 'U'}
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 border-2 border-card">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-xl font-bold text-foreground">{userName}</h2>
            {isVerified && <BadgeCheck className="h-5 w-5 text-green-500" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {userData?.bio || 'Set up your profile to get started'}
          </p>
          {userData?.city && userData?.country && (
            <p className="text-xs text-muted-foreground mt-0.5">{userData.city}, {userData.country}</p>
          )}

          <button
            onClick={copyUID}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:bg-muted/80"
          >
            UID: {USER_UID}
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          </button>

          {/* Interests */}
          {userData?.interests && userData.interests.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {userData.interests.map(i => (
                <span key={i} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {i}
                </span>
              ))}
            </div>
          )}

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

      {/* Verification Images */}
      {userData?.verificationImages && userData.verificationImages.length > 0 && (
        <div className="mx-auto mt-4 max-w-lg px-4 sm:px-6">
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Verification Photos</p>
              <span className={`text-xs font-medium ${isVerified ? 'text-green-500' : 'text-muted-foreground'}`}>
                {userData.verificationImages.length}/5 {isVerified ? '✓ Verified' : ''}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {userData.verificationImages.map((img, idx) => (
                <img key={idx} src={img} alt="" className="aspect-square rounded-lg object-cover" />
              ))}
              {Array.from({ length: 5 - userData.verificationImages.length }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square rounded-lg bg-muted border border-dashed border-border" />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto mt-4 max-w-lg px-4 space-y-2 sm:px-6">
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
