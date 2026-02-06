import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Save } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Travel', 'Photography', 'Music', 'Cooking', 'Fitness',
  'Art', 'Reading', 'Gaming', 'Hiking', 'Dancing',
  'Movies', 'Yoga', 'Beach', 'Coffee', 'Fashion',
];

interface EditProfilePageProps {
  onBack: () => void;
}

export function EditProfilePage({ onBack }: EditProfilePageProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Edit Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <button className="relative flex h-24 w-24 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
              <Camera className="h-7 w-7 text-muted-foreground" />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full gradient-primary shadow-soft">
                <span className="text-xs text-primary-foreground font-bold">+</span>
              </span>
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={50}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    gender === g
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
            <textarea
              placeholder="Tell people about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              maxLength={200}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/200</p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    interests.includes(interest)
                      ? 'gradient-primary text-primary-foreground shadow-soft'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <motion.button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 rounded-2xl gradient-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft"
            whileTap={{ scale: 0.97 }}
          >
            {saved ? (
              <>Saved ✓</>
            ) : (
              <><Save className="h-4 w-4" /> Save Changes</>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
