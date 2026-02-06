import { useState, useCallback } from 'react';
import { UserProfile, MOCK_PROFILES } from '@/lib/data';

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
    if (!dob) {
      setAgeError('Please enter your date of birth');
      return;
    }
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 18) {
      setAgeError('You must be 18 or older to use Trends');
      return;
    }
    setAgeError('');
    setStep('profile');
  }, [dob]);

  const completeProfile = useCallback(() => {
    setStep('done');
  }, []);

  return { step, setStep, dob, setDob, profile, setProfile, ageError, verifyAge, completeProfile };
}

export function useDiscovery() {
  const [profiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<UserProfile[]>([]);

  const like = useCallback(() => {
    setMatches(prev => [...prev, profiles[currentIndex]]);
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, profiles]);

  const skip = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  const currentProfile = currentIndex < profiles.length ? profiles[currentIndex] : null;

  return { currentProfile, like, skip, matches, hasMore: currentIndex < profiles.length };
}
