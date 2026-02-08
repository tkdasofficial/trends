import { ProfileSetup } from '@/components/ProfileSetup';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/hooks/useUserStore';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export default function GetReady() {
  const navigate = useNavigate();
  const { firebaseUser, loading: authLoading, profileComplete, markProfileComplete } = useAuth();
  const { user, updateUser } = useUserStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      navigate('/', { replace: true });
    }
    if (!authLoading && firebaseUser && profileComplete) {
      navigate('/discover', { replace: true });
    }
  }, [authLoading, firebaseUser, profileComplete, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!firebaseUser || saving) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{saving ? 'Saving your profile...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileSetup
      profile={{
        name: user.name || firebaseUser.displayName || '',
        gender: user.gender,
        bio: user.bio,
        interests: user.interests,
      }}
      onUpdate={(p) => {
        updateUser({
          name: p.name || user.name,
          gender: p.gender || '',
          bio: p.bio || '',
          interests: p.interests || [],
        });
      }}
      onGenderPreference={(pref) => {
        updateUser({ genderPreference: pref });
      }}
      onComplete={async () => {
        setSaving(true);
        try {
          // Save profileComplete flag to Firestore
          await setDoc(doc(db, 'users', firebaseUser.uid), { profileComplete: true }, { merge: true });
          localStorage.setItem(`trends_profile_complete_${firebaseUser.uid}`, 'true');
        } catch (err) {
          console.error('Failed to mark profile complete:', err);
          localStorage.setItem(`trends_profile_complete_${firebaseUser.uid}`, 'true');
        }
        updateUser({ profileComplete: true });
        markProfileComplete();
        navigate('/discover', { replace: true });
      }}
    />
  );
}
