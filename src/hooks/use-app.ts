import { useState, useCallback, useEffect } from 'react';
import { UserProfile } from '@/lib/data';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export function useOnboarding() {
  const [step, setStep] = useState<'welcome' | 'age' | 'profile' | 'done'>('welcome');
  const [dob, setDob] = useState('');
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    gender: '',
    bio: '',
    interests: [],
  });
  const [ageError, setAgeError] = useState('');

  const verifyAge = useCallback(() => {
    if (!dob) { setAgeError('Please enter your date of birth'); return; }
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 18) { setAgeError('You must be 18 or older to use Trends'); return; }
    setAgeError('');
    setStep('profile');
  }, [dob]);

  const completeProfile = useCallback(() => { setStep('done'); }, []);

  return { step, setStep, dob, setDob, profile, setProfile, ageError, verifyAge, completeProfile };
}

export function useDiscovery(genderPreference: string = 'All') {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    try {
      let q;
      if (genderPreference && genderPreference !== 'All') {
        q = query(
          collection(db, 'users'),
          where('profileComplete', '==', true),
          where('gender', '==', genderPreference),
          limit(50)
        );
      } else {
        q = query(
          collection(db, 'users'),
          where('profileComplete', '==', true),
          limit(50)
        );
      }

      const snap = await getDocs(q);
      const fetched: UserProfile[] = [];
      snap.forEach(docSnap => {
        if (docSnap.id === uid) return; // Skip self
        const d = docSnap.data() as Record<string, any>;
        fetched.push({
          id: docSnap.id,
          uid: d.uid || docSnap.id.substring(0, 8).toUpperCase(),
          name: d.name || 'User',
          age: d.dob ? calculateAge(d.dob) : 0,
          gender: d.gender || '',
          bio: d.bio || '',
          interests: d.interests || [],
          avatar: d.profileImage || '',
          location: d.city ? `${d.city}${d.country ? ', ' + d.country : ''}` : '',
          country: d.country || '',
          city: d.city || '',
          distance: '',
        });
      });
      setProfiles(fetched);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    }
    setLoading(false);
  }, [genderPreference]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const like = useCallback(() => {
    if (currentIndex < profiles.length) {
      setMatches(prev => [...prev, profiles[currentIndex]]);
    }
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, profiles]);

  const skip = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  const currentProfile = currentIndex < profiles.length ? profiles[currentIndex] : null;

  return {
    currentProfile,
    like,
    skip,
    matches,
    hasMore: currentIndex < profiles.length,
    loading,
    refresh: fetchProfiles,
  };
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
