import { AuthPage } from '@/components/AuthPage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/hooks/useUserStore';
import { useEffect } from 'react';

export default function Auth() {
  const navigate = useNavigate();
  const { firebaseUser, profileComplete } = useAuth();
  const { updateUser } = useUserStore();

  useEffect(() => {
    if (firebaseUser) {
      navigate(profileComplete ? '/discover' : '/get-ready', { replace: true });
    }
  }, [firebaseUser, profileComplete, navigate]);

  return (
    <AuthPage
      onAuthSuccess={(authUser) => {
        updateUser({ name: authUser.name, email: authUser.email, phone: authUser.phone || '', dob: authUser.dob || '' });
      }}
      isSignup={() => {}}
    />
  );
}
