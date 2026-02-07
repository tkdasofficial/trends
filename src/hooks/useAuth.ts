import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthState {
  firebaseUser: User | null;
  loading: boolean;
  isNewUser: boolean;
  profileComplete: boolean;
  emailVerified: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    loading: true,
    isNewUser: false,
    profileComplete: false,
    emailVerified: false,
  });

  useEffect(() => {
    // Timeout fallback - never stay loading more than 4 seconds
    const timeout = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 4000);

    const unsub = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);

      if (!user) {
        setState({ firebaseUser: null, loading: false, isNewUser: false, profileComplete: false, emailVerified: false });
        return;
      }

      // Check localStorage first for instant load, then verify with Firestore
      const localFlag = localStorage.getItem(`trends_profile_complete_${user.uid}`);
      const instantComplete = !!localFlag;

      // Set state immediately with local data (no await)
      setState({
        firebaseUser: user,
        loading: false,
        isNewUser: !instantComplete,
        profileComplete: instantComplete,
        emailVerified: user.emailVerified,
      });

      // Then verify with Firestore in background (non-blocking)
      getDoc(doc(db, 'users', user.uid)).then(userDoc => {
        const profileComplete = userDoc.exists() && userDoc.data()?.profileComplete === true;
        if (profileComplete) {
          localStorage.setItem(`trends_profile_complete_${user.uid}`, 'true');
        }
        setState(prev => ({
          ...prev,
          isNewUser: !profileComplete,
          profileComplete,
          emailVerified: user.emailVerified,
        }));
      }).catch(() => {
        // Firestore failed, keep localStorage value
      });
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    setState({ firebaseUser: null, loading: false, isNewUser: false, profileComplete: false, emailVerified: false });
  };

  const markProfileComplete = () => {
    setState(prev => ({ ...prev, isNewUser: false, profileComplete: true }));
  };

  const refreshEmailVerification = async () => {
    if (state.firebaseUser) {
      await state.firebaseUser.reload();
      setState(prev => ({
        ...prev,
        emailVerified: state.firebaseUser?.emailVerified ?? false,
      }));
    }
  };

  return { ...state, logout, markProfileComplete, refreshEmailVerification };
}
