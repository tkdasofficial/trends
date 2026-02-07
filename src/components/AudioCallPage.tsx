import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/lib/data';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';

interface AudioCallPageProps {
  user: UserProfile;
  direction: 'incoming' | 'outgoing';
  onEnd: () => void;
}

export function AudioCallPage({ user, direction, onEnd }: AudioCallPageProps) {
  const { callState, startCall, endCall, answerCall, rejectCall, toggleMute, toggleSpeaker } = useWebRTC();

  useEffect(() => {
    if (direction === 'outgoing' && callState.status === 'idle') {
      startCall(user.id);
    }
  }, [direction, user.id]);

  const handleEnd = useCallback(() => {
    endCall();
    onEnd();
  }, [endCall, onEnd]);

  const handleAccept = useCallback(() => {
    answerCall();
  }, [answerCall]);

  const handleReject = useCallback(() => {
    rejectCall();
    onEnd();
  }, [rejectCall, onEnd]);

  const status = callState.status === 'idle' ? direction : callState.status;

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-background">
      <div className="absolute inset-0 gradient-hero opacity-20" />

      <div className="relative z-10 flex flex-col items-center pt-16 sm:pt-24">
        <motion.div
          className="mb-6 flex h-28 w-28 items-center justify-center rounded-full overflow-hidden gradient-primary text-5xl font-bold text-primary-foreground shadow-elevated sm:h-32 sm:w-32"
          animate={status === 'incoming' || status === 'outgoing' ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.name[0]
          )}
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{user.name}</h2>

        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            className="mt-2 text-sm text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {status === 'incoming' && 'Incoming audio call...'}
            {status === 'outgoing' && 'Calling...'}
            {status === 'connected' && formatDuration(callState.duration)}
            {status === 'ended' && 'Call ended'}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative z-10 pb-16 sm:pb-20">
        {status === 'incoming' ? (
          <div className="flex items-center gap-8">
            <motion.button onClick={handleReject}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elevated"
              whileTap={{ scale: 0.9 }}>
              <PhoneOff className="h-7 w-7" />
            </motion.button>
            <motion.button onClick={handleAccept}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-primary-foreground shadow-elevated"
              whileTap={{ scale: 0.9 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}>
              <Phone className="h-7 w-7" />
            </motion.button>
          </div>
        ) : status === 'connected' ? (
          <div className="flex items-center gap-6">
            <motion.button onClick={toggleMute}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                callState.muted ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}>
              {callState.muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </motion.button>
            <motion.button onClick={handleEnd}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elevated"
              whileTap={{ scale: 0.9 }}>
              <PhoneOff className="h-7 w-7" />
            </motion.button>
            <motion.button onClick={toggleSpeaker}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                callState.speaker ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}>
              <Volume2 className="h-6 w-6" />
            </motion.button>
          </div>
        ) : status !== 'ended' ? (
          <motion.button onClick={handleEnd}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elevated"
            whileTap={{ scale: 0.9 }}>
            <PhoneOff className="h-7 w-7" />
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
