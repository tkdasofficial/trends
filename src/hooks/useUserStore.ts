import { useState, useCallback, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { uploadImageToCloud } from '@/lib/supabaseStorage';

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
  profileImage: string;
  verificationImages: string[];
  isVerified: boolean;
  profileComplete: boolean;
  uid: string;
  genderPreference: string;
}

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
  profileComplete: false,
  uid: '',
  genderPreference: 'All',
};

/**
 * Generate a unique 12-character alphanumeric UID in format TR-XXXXXXXXXXXX
 * Uses Firebase UID as seed for determinism
 */
function generateUniqueUID(firebaseUid: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  // Use multiple hash passes of the firebase UID for entropy
  let seed = 0;
  for (let i = 0; i < firebaseUid.length; i++) {
    seed = ((seed << 5) - seed + firebaseUid.charCodeAt(i)) | 0;
  }
  for (let i = 0; i < 12; i++) {
    seed = ((seed * 1103515245 + 12345) & 0x7fffffff);
    result += chars[Math.abs(seed) % chars.length];
  }
  return `TR-${result}`;
}

export function useUserStore() {
  const [user, setUser] = useState<UserData>({ ...DEFAULT_USER });
  const [loaded, setLoaded] = useState(false);

  const loadFromFirestore = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoaded(true); return; }

    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data() as Partial<UserData>;
        // Ensure UID is the new 12-char format
        let userUid = data.uid || '';
        if (!userUid || userUid.length < 15) {
          // Old format or missing — regenerate
          userUid = generateUniqueUID(uid);
          setDoc(doc(db, 'users', uid), { uid: userUid }, { merge: true }).catch(() => {});
        }
        setUser({ ...DEFAULT_USER, ...data, uid: userUid });
      } else {
        const userUid = generateUniqueUID(uid);
        setUser(prev => ({
          ...prev,
          name: auth.currentUser?.displayName || '',
          email: auth.currentUser?.email || '',
          uid: userUid,
        }));
        setDoc(doc(db, 'users', uid), { uid: userUid }, { merge: true }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadFromFirestore();
  }, [loadFromFirestore]);

  const saveToFirestore = useCallback(async (data: UserData) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      let profileImageUrl = data.profileImage;
      // Upload profile image to Supabase Storage (Lovable Cloud)
      if (data.profileImage && data.profileImage.startsWith('data:')) {
        profileImageUrl = await uploadImageToCloud(uid, 'profile', data.profileImage);
      }

      const verificationUrls: string[] = [];
      for (let i = 0; i < data.verificationImages.length; i++) {
        const img = data.verificationImages[i];
        if (img.startsWith('data:')) {
          const url = await uploadImageToCloud(uid, `verification_${i}`, img);
          verificationUrls.push(url);
        } else {
          verificationUrls.push(img);
        }
      }

      const saveData = {
        ...data,
        profileImage: profileImageUrl,
        verificationImages: verificationUrls,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), saveData, { merge: true });
      setUser(prev => ({ ...prev, profileImage: profileImageUrl, verificationImages: verificationUrls }));
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
    }
  }, []);

  const updateUser = useCallback((partial: Partial<UserData>) => {
    setUser(prev => {
      const next = { ...prev, ...partial };
      if (partial.verificationImages) {
        next.isVerified = partial.verificationImages.length >= 5;
      }
      setTimeout(() => saveToFirestore(next), 0);
      return next;
    });
  }, [saveToFirestore]);

  const clearUser = useCallback(() => {
    setUser({ ...DEFAULT_USER });
  }, []);

  return { user, updateUser, clearUser, loaded, loadFromFirestore };
}
