import { useState, useCallback, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';

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
};

export function useUserStore() {
  const [user, setUser] = useState<UserData>({ ...DEFAULT_USER });
  const [loaded, setLoaded] = useState(false);

  // Load user data from Firestore on mount
  const loadFromFirestore = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoaded(true); return; }

    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setUser({ ...DEFAULT_USER, ...snap.data() as Partial<UserData> });
      } else {
        // Pre-fill from Firebase Auth
        setUser(prev => ({
          ...prev,
          name: auth.currentUser?.displayName || '',
          email: auth.currentUser?.email || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadFromFirestore();
  }, [loadFromFirestore]);

  // Save to Firestore
  const saveToFirestore = useCallback(async (data: UserData) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      // Upload images to Firebase Storage if they're data URLs
      let profileImageUrl = data.profileImage;
      if (data.profileImage && data.profileImage.startsWith('data:')) {
        profileImageUrl = await uploadImage(uid, 'profile', data.profileImage);
      }

      const verificationUrls: string[] = [];
      for (let i = 0; i < data.verificationImages.length; i++) {
        const img = data.verificationImages[i];
        if (img.startsWith('data:')) {
          const url = await uploadImage(uid, `verification_${i}`, img);
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
      // Still update local state
    }
  }, []);

  const updateUser = useCallback((partial: Partial<UserData>) => {
    setUser(prev => {
      const next = { ...prev, ...partial };
      if (partial.verificationImages) {
        next.isVerified = partial.verificationImages.length >= 5;
      }
      // Debounced save to Firestore
      setTimeout(() => saveToFirestore(next), 0);
      return next;
    });
  }, [saveToFirestore]);

  const clearUser = useCallback(() => {
    setUser({ ...DEFAULT_USER });
  }, []);

  return { user, updateUser, clearUser, loaded, loadFromFirestore };
}

async function uploadImage(uid: string, name: string, dataUrl: string): Promise<string> {
  try {
    const storageRef = ref(storage, `users/${uid}/${name}_${Date.now()}.jpg`);
    await uploadString(storageRef, dataUrl, 'data_url');
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error('Image upload failed, using data URL fallback:', err);
    return dataUrl; // Fallback to data URL if Storage isn't configured
  }
}
