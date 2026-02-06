import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/data';
import { Camera, Sparkles } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Travel', 'Photography', 'Music', 'Cooking', 'Fitness',
  'Art', 'Reading', 'Gaming', 'Hiking', 'Dancing',
  'Movies', 'Yoga', 'Beach', 'Coffee', 'Fashion',
];

interface ProfileSetupProps {
  profile: Partial<UserProfile>;
  onUpdate: (profile: Partial<UserProfile>) => void;
  onComplete: () => void;
}

export function ProfileSetup({ profile, onUpdate, onComplete }: ProfileSetupProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const next = prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest];
      onUpdate({ ...profile, interests: next });
      return next;
    });
  };

  const isValid = profile.name && profile.name.length > 0 && profile.gender && selectedInterests.length >= 2;

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-12">
      <motion.div
        className="w-full max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-1 text-2xl font-bold text-foreground">Set Up Profile</h2>
        <p className="mb-8 text-muted-foreground">Tell us about yourself</p>

        {/* Avatar */}
        <div className="mb-8 flex justify-center">
          <button className="relative flex h-28 w-28 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80">
            <Camera className="h-8 w-8 text-muted-foreground" />
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full gradient-primary shadow-soft">
              <span className="text-xs text-primary-foreground font-bold">+</span>
            </span>
          </button>
        </div>

        {/* Name */}
        <label className="mb-2 block text-sm font-medium text-foreground">Name</label>
        <input
          type="text"
          placeholder="Your name"
          value={profile.name || ''}
          onChange={(e) => onUpdate({ ...profile, name: e.target.value })}
          className="mb-5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={50}
        />

        {/* Gender */}
        <label className="mb-2 block text-sm font-medium text-foreground">Gender</label>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {['Male', 'Female', 'Other'].map(g => (
            <button
              key={g}
              onClick={() => onUpdate({ ...profile, gender: g })}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                profile.gender === g
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Bio */}
        <label className="mb-2 block text-sm font-medium text-foreground">Bio</label>
        <textarea
          placeholder="A little about you..."
          value={profile.bio || ''}
          onChange={(e) => onUpdate({ ...profile, bio: e.target.value })}
          className="mb-5 w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          maxLength={200}
        />

        {/* Interests */}
        <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Interests <span className="text-muted-foreground">(pick at least 2)</span>
        </label>
        <div className="mb-8 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedInterests.includes(interest)
                  ? 'gradient-primary text-primary-foreground shadow-soft'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>

        <motion.button
          onClick={onComplete}
          disabled={!isValid}
          className="w-full rounded-2xl gradient-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-soft transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.97 } : {}}
        >
          Start Exploring
        </motion.button>
      </motion.div>
    </div>
  );
}
