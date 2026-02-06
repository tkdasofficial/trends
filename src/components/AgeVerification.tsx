import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface AgeVerificationProps {
  dob: string;
  onDobChange: (val: string) => void;
  onVerify: () => void;
  error: string;
}

export function AgeVerification({ dob, onDobChange, onVerify, error }: AgeVerificationProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-8">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
          Verify Your Age
        </h2>
        <p className="mb-8 text-center text-muted-foreground">
          You must be 18 or older to use Trends
        </p>

        <label className="mb-2 block text-sm font-medium text-foreground">
          Date of Birth
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => onDobChange(e.target.value)}
          className="mb-4 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          max={new Date().toISOString().split('T')[0]}
        />

        {error && (
          <motion.div
            className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <motion.button
          onClick={onVerify}
          className="w-full rounded-2xl gradient-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-soft transition-transform active:scale-95"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}
