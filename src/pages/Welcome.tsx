import { WelcomeScreen } from '@/components/WelcomeScreen';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  return <WelcomeScreen onGetStarted={() => navigate('/auth')} />;
}
