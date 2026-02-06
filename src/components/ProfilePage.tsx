import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Edit3, LogOut, ChevronRight } from 'lucide-react';

export function ProfilePage() {
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="relative gradient-hero px-6 pb-20 pt-12">
        <h1 className="text-lg font-bold text-primary-foreground">My Profile</h1>
      </div>

      {/* Avatar card */}
      <div className="px-6 -mt-14">
        <div className="rounded-3xl bg-card p-6 shadow-card text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground">
            U
          </div>
          <h2 className="text-xl font-bold text-foreground">Your Name</h2>
          <p className="text-sm text-muted-foreground">Set up your profile to get started</p>
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
      <div className="mt-6 px-6 space-y-2">
        {[
          { icon: Edit3, label: 'Edit Profile', sub: 'Update your info' },
          { icon: Bell, label: 'Notifications', sub: 'Manage alerts' },
          { icon: Shield, label: 'Privacy & Safety', sub: 'Moderation rules' },
          { icon: Settings, label: 'Settings', sub: 'Account preferences' },
        ].map(({ icon: Icon, label, sub }) => (
          <motion.button
            key={label}
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-card text-left transition-colors hover:bg-muted/50"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        ))}

        <motion.button
          className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-card text-left transition-colors hover:bg-destructive/5"
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
