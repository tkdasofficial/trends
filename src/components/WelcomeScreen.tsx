import { motion } from 'framer-motion';
import { TrendsLogo } from './TrendsLogo';
import onboardingBg from '@/assets/onboarding-bg.jpg';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-end overflow-hidden bg-background">
      <img
        src={onboardingBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />

      <motion.div
        className="relative z-10 flex flex-col items-center px-6 pb-14 sm:px-8 sm:pb-20 w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <TrendsLogo size={72} />
        </motion.div>

        <motion.h1
          className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Trends
        </motion.h1>

        <motion.p
          className="mt-2 text-center text-base text-muted-foreground sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Discover connections that matter
        </motion.p>

        <motion.button
          onClick={onGetStarted}
          className="mt-10 w-full rounded-2xl gradient-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-elevated transition-transform active:scale-95"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.button>

        <motion.p
          className="mt-4 text-xs text-center text-muted-foreground"
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
