import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/lib/data';
import { Heart, X, MapPin } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
  onLike: () => void;
  onSkip: () => void;
}

const AVATAR_COLORS = [
  'from-primary to-secondary',
  'from-accent to-primary',
  'from-secondary to-accent',
];

export function ProfileCard({ profile, onLike, onSkip }: ProfileCardProps) {
  const colorClass = AVATAR_COLORS[parseInt(profile.id) % AVATAR_COLORS.length];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={profile.id}
        className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: -200 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Avatar area */}
        <div className={`relative flex h-80 items-end bg-gradient-to-br ${colorClass}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-bold text-primary-foreground/20">
              {profile.name[0]}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="relative z-10 w-full p-6">
            <h3 className="text-2xl font-bold text-foreground">
              {profile.name}, {profile.age}
            </h3>
            {profile.distance && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {profile.distance} away
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-6 pt-3">
          <p className="mb-4 text-foreground">{profile.bio}</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {profile.interests.map(i => (
              <span
                key={i}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                {i}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-6">
            <motion.button
              onClick={onSkip}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6" />
            </motion.button>
            <motion.button
              onClick={onLike}
              className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-elevated"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="h-7 w-7" fill="currentColor" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
