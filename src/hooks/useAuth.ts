import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthState {
  firebaseUser: User | null;
  loading: boolean;
  isNewUser: boolean;
  profileComplete: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    loading: true,
    isNewUser: false,
    profileComplete: false,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ firebaseUser: null, loading: false, isNewUser: false, profileComplete: false });
        return;
      }

      // Check if user has completed profile setup in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const profileComplete = userDoc.exists() && userDoc.data()?.profileComplete === true;
        setState({
          firebaseUser: user,
          loading: false,
          isNewUser: !profileComplete,
          profileComplete,
        });
      } catch {
        // If Firestore fails, check localStorage fallback
        const localFlag = localStorage.getItem(`trends_profile_complete_${user.uid}`);
        setState({
          firebaseUser: user,
          loading: false,
          isNewUser: !localFlag,
          profileComplete: !!localFlag,
        });
      }
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setState({ firebaseUser: null, loading: false, isNewUser: false, profileComplete: false });
  };

  const markProfileComplete = () => {
    setState(prev => ({ ...prev, isNewUser: false, profileComplete: true }));
  };

  return { ...state, logout, markProfileComplete };
}
