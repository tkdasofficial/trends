import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/data';
import { ArrowLeft, MapPin, Copy, Check, MessageCircle, Phone, Flag } from 'lucide-react';
import { useState } from 'react';

interface ChatProfilePageProps {
  user: UserProfile;
  onBack: () => void;
  onMessage?: () => void;
  onCall?: () => void;
}

export function ChatProfilePage({ user, onBack, onMessage, onCall }: ChatProfilePageProps) {
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  const copyUID = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header gradient - reduced height */}
      <div className="relative gradient-hero px-4 pb-14 pt-12 sm:px-6">
        <button onClick={onBack} className="mb-4 text-primary-foreground/80 hover:text-primary-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Profile card with overlapping avatar */}
      <div className="px-4 -mt-10 sm:px-6">
        <motion.div
          className="mx-auto max-w-lg rounded-3xl bg-card pt-14 pb-6 px-6 shadow-card text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Avatar overlapping card top */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-10">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover border-4 border-card shadow-elevated"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground border-4 border-card shadow-elevated">
                {user.name[0]}
              </div>
            )}
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

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            {onMessage && (
              <motion.button
                onClick={onMessage}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl gradient-primary py-3 text-sm font-bold text-primary-foreground"
                whileTap={{ scale: 0.97 }}
              >
                <MessageCircle className="h-4 w-4" /> Message
              </motion.button>
            )}
            {onCall && (
              <motion.button
                onClick={onCall}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-white shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Report */}
      <div className="mx-auto mt-6 max-w-lg px-4 pb-8 sm:px-6">
        <button
          onClick={() => setReported(true)}
          disabled={reported}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card p-3.5 shadow-card text-sm text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
        >
          <Flag className="h-4 w-4" />
          {reported ? 'Reported' : 'Report User'}
        </button>
      </div>
    </div>
  );
}
