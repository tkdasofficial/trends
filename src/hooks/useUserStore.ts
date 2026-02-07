import { useState, useCallback, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

// Generate a unique UID from Firebase auth UID
function generateUniqueUID(firebaseUid: string): string {
  // Use first 4 chars of firebase UID + timestamp hash for uniqueness
  const hash = firebaseUid.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const hex = Math.abs(hash).toString(36).toUpperCase().substring(0, 4);
  const suffix = firebaseUid.substring(0, 4).toUpperCase();
  return `TR-${suffix}${hex}`;
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
        // Ensure UID is set
        const userUid = data.uid || generateUniqueUID(uid);
        setUser({ ...DEFAULT_USER, ...data, uid: userUid });
        // Save UID if not yet persisted
        if (!data.uid) {
          setDoc(doc(db, 'users', uid), { uid: userUid }, { merge: true }).catch(() => {});
        }
      } else {
        const userUid = generateUniqueUID(uid);
        setUser(prev => ({
          ...prev,
          name: auth.currentUser?.displayName || '',
          email: auth.currentUser?.email || '',
          uid: userUid,
        }));
        // Create initial doc with UID
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

  // Upload image as blob (not data URL) to Firebase Storage
  const uploadImageBlob = useCallback(async (firebaseUid: string, name: string, dataUrl: string): Promise<string> => {
    try {
      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const storageRef = ref(storage, `users/${firebaseUid}/${name}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error('Image upload failed:', err);
      return dataUrl; // Fallback
    }
  }, []);

  const saveToFirestore = useCallback(async (data: UserData) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      let profileImageUrl = data.profileImage;
      if (data.profileImage && data.profileImage.startsWith('data:')) {
        profileImageUrl = await uploadImageBlob(uid, 'profile', data.profileImage);
      }

      const verificationUrls: string[] = [];
      for (let i = 0; i < data.verificationImages.length; i++) {
        const img = data.verificationImages[i];
        if (img.startsWith('data:')) {
          const url = await uploadImageBlob(uid, `verification_${i}`, img);
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
  }, [uploadImageBlob]);

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
