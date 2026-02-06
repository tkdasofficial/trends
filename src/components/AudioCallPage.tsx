import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/lib/data';
import { Phone, PhoneOff, Mic, MicOff, Volume2, X } from 'lucide-react';

type CallState = 'incoming' | 'outgoing' | 'connected' | 'ended';

interface AudioCallPageProps {
  user: UserProfile;
  direction: 'incoming' | 'outgoing';
  onEnd: () => void;
}

export function AudioCallPage({ user, direction, onEnd }: AudioCallPageProps) {
  const [callState, setCallState] = useState<CallState>(direction);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    if (callState === 'outgoing') {
      const t = setTimeout(() => setCallState('connected'), 3000);
      return () => clearTimeout(t);
    }
  }, [callState]);

  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const endCall = useCallback(() => {
    setCallState('ended');
    setTimeout(onEnd, 800);
  }, [onEnd]);

  const acceptCall = useCallback(() => {
    setCallState('connected');
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-20" />

      {/* Top section */}
      <div className="relative z-10 flex flex-col items-center pt-16 sm:pt-24">
        <motion.div
          className="mb-6 flex h-28 w-28 items-center justify-center rounded-full gradient-primary text-5xl font-bold text-primary-foreground shadow-elevated sm:h-32 sm:w-32"
          animate={callState === 'incoming' || callState === 'outgoing' ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {user.name[0]}
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{user.name}</h2>

        <AnimatePresence mode="wait">
          <motion.p
            key={callState}
            className="mt-2 text-sm text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {callState === 'incoming' && 'Incoming audio call...'}
            {callState === 'outgoing' && 'Calling...'}
            {callState === 'connected' && formatDuration(duration)}
            {callState === 'ended' && 'Call ended'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="relative z-10 pb-16 sm:pb-20">
        {callState === 'incoming' ? (
          <div className="flex items-center gap-8">
            {/* Reject */}
            <motion.button
              onClick={endCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elevated sm:h-18 sm:w-18"
              whileTap={{ scale: 0.9 }}
            >
              <PhoneOff className="h-7 w-7" />
            </motion.button>

            {/* Accept */}
            <motion.button
              onClick={acceptCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-primary-foreground shadow-elevated sm:h-18 sm:w-18"
              whileTap={{ scale: 0.9 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <Phone className="h-7 w-7" />
            </motion.button>
          </div>
        ) : callState === 'connected' ? (
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => setMuted(!muted)}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                muted ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </motion.button>

            <motion.button
              onClick={endCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elevated"
              whileTap={{ scale: 0.9 }}
            >
              <PhoneOff className="h-7 w-7" />
            </motion.button>

            <motion.button
              onClick={() => setSpeaker(!speaker)}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                speaker ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Volume2 className="h-6 w-6" />
            </motion.button>
          </div>
        ) : callState === 'outgoing' ? (
          <motion.button
            onClick={endCall}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elevated"
            whileTap={{ scale: 0.9 }}
          >
            <PhoneOff className="h-7 w-7" />
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
