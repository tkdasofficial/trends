import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Save, X, ImagePlus, BadgeCheck, Search } from 'lucide-react';
import { UserData } from '@/hooks/useUserStore';

const INTEREST_OPTIONS = [
  'Travel', 'Photography', 'Music', 'Cooking', 'Fitness',
  'Art', 'Reading', 'Gaming', 'Hiking', 'Dancing',
  'Movies', 'Yoga', 'Beach', 'Coffee', 'Fashion',
];

const GENDER_PREF_OPTIONS = ['All', 'Male', 'Female', 'Other'];

interface EditProfilePageProps {
  onBack: () => void;
  userData: UserData;
  onSave: (data: Partial<UserData>) => void;
}

export function EditProfilePage({ onBack, userData, onSave }: EditProfilePageProps) {
  const [name, setName] = useState(userData.name);
  const [bio, setBio] = useState(userData.bio);
  const [gender, setGender] = useState(userData.gender);
  const [genderPreference, setGenderPreference] = useState(userData.genderPreference || 'All');
  const [city, setCity] = useState(userData.city);
  const [country, setCountry] = useState(userData.country);
  const [interests, setInterests] = useState<string[]>(userData.interests);
  const [profileImage, setProfileImage] = useState(userData.profileImage);
  const [verificationImages, setVerificationImages] = useState<string[]>(userData.verificationImages);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const profileInputRef = useRef<HTMLInputElement>(null);
  const verifyInputRef = useRef<HTMLInputElement>(null);

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be under 5MB'); return; }
    setUploadError('');
    const compressed = await compressToDataUrl(file);
    setProfileImage(compressed);
    if (profileInputRef.current) profileInputRef.current.value = '';
  };

  const handleVerificationImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (verificationImages.length >= 5) { setUploadError('Maximum 5 verification images'); return; }
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be under 5MB'); return; }
    setUploadError('');
    const compressed = await compressToDataUrl(file);
    setVerificationImages(prev => [...prev, compressed]);
    if (verifyInputRef.current) verifyInputRef.current.value = '';
  };

  const removeVerificationImage = (idx: number) => {
    setVerificationImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave({
      name, bio, gender, genderPreference, city, country, interests,
      profileImage, verificationImages,
      isVerified: verificationImages.length >= 5,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 1000);
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
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <button onClick={() => profileInputRef.current?.click()} className="relative">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <Camera className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full gradient-primary shadow-soft">
                <span className="text-xs text-primary-foreground font-bold">+</span>
              </span>
            </button>
            <p className="mt-2 text-xs text-muted-foreground">Tap to change profile picture</p>
          </div>
          <input ref={profileInputRef} type="file" accept="image/*" onChange={handleProfilePicture} className="hidden" />

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
            <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" maxLength={50} />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {['Male', 'Female', 'Other'].map(g => (
                <button key={g} onClick={() => setGender(g)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${gender === g ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Search className="h-4 w-4 text-primary" />
              Looking for
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GENDER_PREF_OPTIONS.map(g => (
                <button key={g} onClick={() => setGenderPreference(g)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${genderPreference === g ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
            <textarea placeholder="Tell people about yourself..." value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" rows={3} maxLength={200} />
            <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/200</p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
              <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <button key={interest} onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${interests.includes(interest) ? 'gradient-primary text-primary-foreground shadow-soft' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Images */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <BadgeCheck className="h-4 w-4 text-green-500" />
              Verification Photos <span className="text-muted-foreground">({verificationImages.length}/5)</span>
            </label>
            <p className="mb-3 text-xs text-muted-foreground">Upload 5 clear face photos to get verified</p>
            <div className="grid grid-cols-5 gap-2">
              {verificationImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => removeVerificationImage(idx)}
                    className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {verificationImages.length < 5 && (
                <button onClick={() => verifyInputRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors">
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>
            {verificationImages.length >= 5 && (
              <p className="mt-2 text-xs text-green-500 font-medium flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5" /> Photos uploaded! Verify email for badge.
              </p>
            )}
          </div>
          <input ref={verifyInputRef} type="file" accept="image/*" onChange={handleVerificationImage} className="hidden" />

          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

          <motion.button onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 rounded-2xl gradient-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft"
            whileTap={{ scale: 0.97 }}>
            {saved ? <>Saved ✓</> : <><Save className="h-4 w-4" /> Save Changes</>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

async function compressToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = (height / width) * maxDim; width = maxDim; }
          else { width = (width / height) * maxDim; height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);
        const target = 500 * 1024 * 1.37;
        while (result.length > target && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(result);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
