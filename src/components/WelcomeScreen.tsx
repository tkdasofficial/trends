import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import onboardingBg from '@/assets/onboarding-bg.jpg';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden bg-background">
      <img
        src={onboardingBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      <motion.div
        className="relative z-10 flex flex-col items-center px-8 pb-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary shadow-elevated"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Heart className="h-10 w-10 text-primary-foreground" fill="currentColor" />
        </motion.div>

        <motion.h1
          className="mb-2 text-4xl font-extrabold tracking-tight text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Trends
        </motion.h1>

        <motion.p
          className="mb-10 text-center text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Discover connections that matter
        </motion.p>

        <motion.button
          onClick={onGetStarted}
          className="w-full max-w-xs rounded-2xl gradient-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-elevated transition-transform active:scale-95"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.button>

        <motion.p
          className="mt-4 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          By continuing, you agree to our Terms & Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
}
