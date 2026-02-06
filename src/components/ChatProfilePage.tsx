import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/data';
import { ArrowLeft, MapPin, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatProfilePageProps {
  user: UserProfile;
  onBack: () => void;
}

export function ChatProfilePage({ user, onBack }: ChatProfilePageProps) {
  const [copied, setCopied] = useState(false);

  const copyUID = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="relative gradient-hero px-4 pb-24 pt-12 sm:px-6">
        <button onClick={onBack} className="mb-4 text-primary-foreground/80 hover:text-primary-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Profile card */}
      <div className="px-4 -mt-16 sm:px-6">
        <motion.div
          className="mx-auto max-w-lg rounded-3xl bg-card p-6 shadow-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-4xl font-bold text-primary-foreground">
            {user.name[0]}
          </div>
          <h2 className="text-xl font-bold text-foreground">{user.name}, {user.age}</h2>
          <p className="text-sm text-muted-foreground">{user.gender}</p>

          {user.location && (
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {user.city || user.location}{user.country ? `, ${user.country}` : ''}
            </p>
          )}

          {/* UID */}
          <button
            onClick={copyUID}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:bg-muted/80"
          >
            UID: {user.uid}
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          </button>

          {/* Bio */}
          {user.bio && (
            <p className="mt-4 text-sm text-foreground">{user.bio}</p>
          )}

          {/* Interests */}
          {user.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {user.interests.map(i => (
                <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {i}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 flex justify-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{user.distance || '—'}</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-lg font-bold text-foreground">{user.interests.length}</p>
              <p className="text-xs text-muted-foreground">Interests</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
