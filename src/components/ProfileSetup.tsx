import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/data';
import { Camera, Sparkles, X, Loader2, ImagePlus } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

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
  const { images, addImage, removeImage, maxImages } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const next = prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest];
      onUpdate({ ...profile, interests: next });
      return next;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    const err = await addImage(file);
    if (err) setUploadError(err);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isValid = profile.name && profile.name.length > 0 && profile.gender && selectedInterests.length >= 2;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-6 py-10">
      <motion.div
        className="w-full max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-1 text-2xl font-bold text-foreground">Getting Ready</h2>
        <p className="mb-6 text-muted-foreground text-sm">Set up your profile to start connecting</p>

        {/* Profile Photos - up to 5 */}
        <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Camera className="h-4 w-4 text-primary" />
          Photos <span className="text-muted-foreground">({images.length}/{maxImages})</span>
        </label>
        <p className="mb-3 text-xs text-muted-foreground">
          Upload up to 5 clear photos • Max 5MB each • Auto-compressed
        </p>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {images.map(img => (
            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <img src={img.preview} alt="" className="h-full w-full object-cover" />
              {img.status === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors"
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            </button>
          )}
        </div>
        {uploadError && (
          <p className="mb-3 text-xs text-destructive">{uploadError}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

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
