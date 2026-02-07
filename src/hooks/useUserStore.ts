import { useState, useCallback, useEffect } from 'react';

export interface UserData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bio: string;
  interests: string[];
  city: string;
  country: string;
  profileImage: string; // first image = profile pic
  verificationImages: string[]; // up to 5 for badge
  isVerified: boolean;
}

const STORAGE_KEY = 'trends_user_data';

const DEFAULT_USER: UserData = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  bio: '',
  interests: [],
  city: '',
  country: '',
  profileImage: '',
  verificationImages: [],
  isVerified: false,
};

function loadUser(): UserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_USER, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_USER };
}

function saveUser(data: UserData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useUserStore() {
  const [user, setUser] = useState<UserData>(loadUser);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  const updateUser = useCallback((partial: Partial<UserData>) => {
    setUser(prev => {
      const next = { ...prev, ...partial };
      // Auto-verify: 5 valid images uploaded
      if (partial.verificationImages) {
        next.isVerified = partial.verificationImages.length >= 5;
      }
      return next;
    });
  }, []);

  const clearUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser({ ...DEFAULT_USER });
  }, []);

  return { user, updateUser, clearUser };
}
